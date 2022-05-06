import { BigInt } from "@graphprotocol/graph-ts";
import {
  Swap as SwapParams,
  Transfer as TransferParams,
  AddLiquidity as AddLiquidityParams,
  Approval as ApprovalParams,
  RemoveLiquidity as RemoveLiquidityParams,
} from "../generated/ExchangeFactory/Exchange";
import {
  Transfer,
  Swap,
  Liquidity,
  Approval,
  Exchange,
  ExchangeDayData,
} from "../generated/schema";

export function handleSwap(event: SwapParams): void {
  let swap = Swap.load(event.transaction.hash.toHex());

  if (!swap) {
    swap = new Swap(event.transaction.hash.toHex());
  }

  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayStartTimestamp = dayID * 86400;
  let dayExchangeID = event.address
    .toHexString()
    .concat("-")
    .concat(BigInt.fromI32(dayID).toString());
  let exchange = Exchange.load(event.address.toHexString());

  let exchangeDayData = ExchangeDayData.load(dayExchangeID);

  if (!exchangeDayData) {
    exchangeDayData = new ExchangeDayData(dayExchangeID);
    exchangeDayData.exchange = event.address.toHexString();
    exchangeDayData.date = BigInt.fromI32(dayStartTimestamp);
    exchangeDayData.baseToken = exchange!.baseToken;
    exchangeDayData.quoteToken = exchange!.quoteToken;
    exchangeDayData.createdAtTimestamp = event.block.timestamp;
    exchangeDayData.dailyTxns = BigInt.fromI32(0);
  }

  exchangeDayData.dailyTxns = exchangeDayData.dailyTxns.plus(BigInt.fromI32(1));

  exchangeDayData.save();

  exchange!.dailyTxns = exchangeDayData.dailyTxns;

  exchange!.derivedBaseTokenLiquidity = exchange!.derivedBaseTokenLiquidity.plus(
    event.params.baseTokenQtyIn.toBigDecimal()
  );
  exchange!.derivedBaseTokenLiquidity = exchange!.derivedBaseTokenLiquidity.minus(
    event.params.baseTokenQtyOut.toBigDecimal()
  );
  exchange!.derivedQuoteTokenLiquidity = exchange!.derivedQuoteTokenLiquidity.plus(
    event.params.quoteTokenQtyIn.toBigDecimal()
  );
  exchange!.derivedQuoteTokenLiquidity = exchange!.derivedQuoteTokenLiquidity.minus(
    event.params.quoteTokenQtyOut.toBigDecimal()
  );

  exchange!.save();

  swap.baseTokenQtyIn = event.params.baseTokenQtyIn;
  swap.quoteTokenQtyIn = event.params.quoteTokenQtyIn;
  swap.baseTokenQtyOut = event.params.baseTokenQtyOut;
  swap.quoteTokenQtyOut = event.params.quoteTokenQtyOut;
  swap.sender = event.params.sender;
  swap.createdAtTimestamp = event.block.timestamp;
  swap.exchange = event.address.toHexString();
  swap.save();
}

export function handleTransfer(event: TransferParams): void {
  let tranfer = Transfer.load(event.transaction.hash.toHex());

  if (!tranfer) {
    tranfer = new Transfer(event.transaction.hash.toHex());
  }

  tranfer.exchange = event.address.toHexString();
  tranfer.from = event.params.from;
  tranfer.to = event.params.to;
  tranfer.value = event.params.value;
  tranfer.createdAtTimestamp = event.block.timestamp;

  tranfer.save();
}

export function handleAddLiquidity(event: AddLiquidityParams): void {
  let addLiquidity = Liquidity.load(event.transaction.hash.toHex());

  if (!addLiquidity) {
    addLiquidity = new Liquidity(event.transaction.hash.toHex());
  }

  addLiquidity.exchange = event.address.toHexString();

  let exchange = Exchange.load(event.address.toHexString());

  exchange!.derivedBaseTokenLiquidity = exchange!.derivedBaseTokenLiquidity.plus(
    event.params.baseTokenQtyAdded.toBigDecimal()
  );

  exchange!.derivedQuoteTokenLiquidity = exchange!.derivedQuoteTokenLiquidity.plus(
    event.params.quoteTokenQtyAdded.toBigDecimal()
  );

  exchange!.save();

  addLiquidity.added = true;
  addLiquidity.baseTokenQty = event.params.baseTokenQtyAdded;
  addLiquidity.quoteTokenQty = event.params.quoteTokenQtyAdded;
  addLiquidity.liquidityProvider = event.params.liquidityProvider;
  addLiquidity.createdAtTimestamp = event.block.timestamp;
  addLiquidity.save();
}

export function handleApproval(event: ApprovalParams): void {
  let approval = Approval.load(event.transaction.hash.toHex());

  if (!approval) {
    approval = new Approval(event.transaction.hash.toHex());
  }

  approval.exchange = event.address.toHexString();
  approval.owner = event.params.owner;
  approval.spender = event.params.spender;
  approval.value = event.params.value;
  approval.createdAtTimestamp = event.block.timestamp;

  approval.save();
}

export function handleRemoveLiquidity(event: RemoveLiquidityParams): void {
  let removeLiquidity = Liquidity.load(event.transaction.hash.toHex());

  if (!removeLiquidity) {
    removeLiquidity = new Liquidity(event.transaction.hash.toHex());
  }

  removeLiquidity.exchange = event.address.toHexString();

  let exchange = Exchange.load(event.address.toHexString());

  exchange!.derivedBaseTokenLiquidity = exchange!.derivedBaseTokenLiquidity.minus(
    event.params.baseTokenQtyRemoved.toBigDecimal()
  );

  exchange!.derivedQuoteTokenLiquidity = exchange!.derivedQuoteTokenLiquidity.minus(
    event.params.quoteTokenQtyRemoved.toBigDecimal()
  );

  exchange!.save();

  removeLiquidity.added = false;
  removeLiquidity.baseTokenQty = event.params.baseTokenQtyRemoved;
  removeLiquidity.quoteTokenQty = event.params.quoteTokenQtyRemoved;
  removeLiquidity.liquidityProvider = event.params.liquidityProvider;
  removeLiquidity.createdAtTimestamp = event.block.timestamp;
  removeLiquidity.save();
}
