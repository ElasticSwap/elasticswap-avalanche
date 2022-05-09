import { Address } from "@graphprotocol/graph-ts";
import { Exchange } from "../generated/schema";
import { Exchange as ExchangeContract } from "../generated/ExchangeFactory/Exchange";
import { ERC20 } from "../generated/ExchangeFactory/ERC20";

export function updateExchangeTotalSupply(exchangeAddress: Address): void {
  let exchangeContract = ExchangeContract.bind(exchangeAddress);
  let exchange = Exchange.load(exchangeAddress.toHexString());
  exchange!.totalSupply = exchangeContract.totalSupply();
  exchange!.baseTokenQty = ERC20.bind(exchangeContract.baseToken())
    .balanceOf(exchangeContract._address)
    .toBigDecimal();
  exchange!.quoteTokenQty = ERC20.bind(exchangeContract.quoteToken())
    .balanceOf(exchangeContract._address)
    .toBigDecimal();
  exchange!.save();
}
