/**
 * Pure diamond-mesh calculation engine.
 * This module contains no DOM or browser state, so it can be unit-tested independently.
 */
import { convert, convertWeight, formatNumber } from './utils.js';

export function calculateMesh({
  inputValue = 0, unit = 'inch', measureType = 'stretch', stretchType = 'v',
  stretchV = 70, stretchH = 70, rows = 0, cols = 0, targetV = 0, targetH = 0,
  targetVUnit = 'ft', targetHUnit = 'ft', totalUnit = 'ft', netWeight = 0,
  netWeightUnit = 'kg', wplLengthUnit = 'ft', wplWeightUnit = 'kg',
  lengthQuery = 0, lengthQueryUnit = 'ft', weightQuery = 0,
  weightQueryUnit = 'kg', weightQueryLengthUnit = 'ft'
} = {}) {
  const inputVal=Math.max(0,Number(inputValue)||0);
  const sv=Math.min(1,Math.max(0,(Number(stretchV)||0)/100));
  const sh=Math.min(1,Math.max(0,(Number(stretchH)||0)/100));
  let vf,hf;
  if(stretchType==='v'){vf=sv;hf=Math.sqrt(Math.max(0,1-sv*sv))}
  else if(stretchType==='h'){hf=sh;vf=Math.sqrt(Math.max(0,1-sh*sh))}
  else{vf=sv;hf=sh}
  let cv,ch,barLength;
  if(measureType==='stretch'){cv=inputVal*vf;ch=inputVal*hf;barLength=inputVal/2}
  else{cv=2*inputVal*vf;ch=2*inputVal*hf;barLength=inputVal}
  const wholeRows=Math.max(0,Math.floor(Number(rows)||0));
  const wholeCols=Math.max(0,Math.floor(Number(cols)||0));
  if(measureType==='stretch'){
    return finalize({inputVal,sv,sh,vf,hf,cv,ch,barLength,rows:wholeRows,cols:wholeCols,
      verticalResult:inputVal>0&&wholeRows>0?`${formatNumber(convert(wholeRows*cv,unit,totalUnit))} ${totalUnit}`:'—',
      horizontalResult:inputVal>0&&wholeCols>0?`${formatNumber(convert(wholeCols*ch,unit,totalUnit))} ${totalUnit}`:'—',
      unit,stretchType,measureType,totalUnit,netWeight,netWeightUnit,wplLengthUnit,wplWeightUnit,
      lengthQuery,lengthQueryUnit,weightQuery,weightQueryUnit,weightQueryLengthUnit});
  }
  const tv=Math.max(0,Number(targetV)||0),th=Math.max(0,Number(targetH)||0);
  const requiredRows=cv>0&&tv>0?Math.ceil(convert(tv,targetVUnit,unit)/cv):0;
  const requiredCols=ch>0&&th>0?Math.ceil(convert(th,targetHUnit,unit)/ch):0;
  return finalize({inputVal,sv,sh,vf,hf,cv,ch,barLength,rows:requiredRows,cols:requiredCols,
    verticalResult:requiredRows>0?`${requiredRows} holes`:'—',
    horizontalResult:requiredCols>0?`${requiredCols} holes`:'—',
    unit,stretchType,measureType,totalUnit,netWeight,netWeightUnit,wplLengthUnit,wplWeightUnit,
    lengthQuery,lengthQueryUnit,weightQuery,weightQueryUnit,weightQueryLengthUnit});
}
function finalize(data){
  const {inputVal,cv,ch,barLength,rows,cols,unit,netWeight,netWeightUnit,wplLengthUnit,wplWeightUnit,
    lengthQuery,lengthQueryUnit,weightQuery,weightQueryUnit,weightQueryLengthUnit}=data;
  let impliedBar=null,impliedRatio=null;
  if(data.stretchType==='both'&&inputVal>0&&barLength>0){impliedBar=Math.sqrt((cv/2)**2+(ch/2)**2);impliedRatio=impliedBar/barLength}
  const totalHorizontalBase=cols*ch,nw=Number(netWeight)||0;
  let ratePerBaseUnitInGrams=null,weightPerLength=null,weightBasis='';
  if(nw>0&&totalHorizontalBase>0){
    const totalHorizontalInLengthUnit=convert(totalHorizontalBase,unit,wplLengthUnit);
    weightPerLength=convertWeight(nw,netWeightUnit,wplWeightUnit)/totalHorizontalInLengthUnit;
    weightBasis=`Based on ${nw} ${netWeightUnit} over total horizontal length of ${totalHorizontalInLengthUnit} ${wplLengthUnit}.`;
    ratePerBaseUnitInGrams=convertWeight(nw,netWeightUnit,'g')/totalHorizontalBase;
  }
  let lengthQueryWeight=0;
  if(ratePerBaseUnitInGrams!==null&&Number(lengthQuery)>0)lengthQueryWeight=convertWeight(convert(Number(lengthQuery),lengthQueryUnit,unit)*ratePerBaseUnitInGrams,'g',netWeightUnit);
  let weightQueryLength=0;
  if(ratePerBaseUnitInGrams!==null&&ratePerBaseUnitInGrams>0&&Number(weightQuery)>0)weightQueryLength=convert(convertWeight(Number(weightQuery),weightQueryUnit,'g')/ratePerBaseUnitInGrams,unit,weightQueryLengthUnit);
  return {...data,totalHorizontalBase,ratePerBaseUnitInGrams,weightPerLength,weightBasis,lengthQueryWeight,weightQueryLength,impliedBar,impliedRatio};
}