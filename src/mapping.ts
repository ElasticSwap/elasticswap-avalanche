import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import {
  ExchangeFactory,
  NewExchange,
  OwnershipTransferred,
  SetFeeAddress,
} from "../generated/ExchangeFactory/ExchangeFactory";
import { Exchange as ExchangeContract } from "../generated/ExchangeFactory/Exchange";
import { ERC20 } from "../generated/ExchangeFactory/ERC20";
import { Exchange, Token } from "../generated/schema";

export function handleNewExchange(event: NewExchange): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())

  let exchange = Exchange.load(event.transaction.hash.toHex());
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!exchange) {
    // entity = new ExampleEntity(event.transaction.from.toHex())
    exchange = new Exchange(event.transaction.hash.toHex());
  }

  // Entity fields can be set based on event parameters
  exchange.creator = event.params.creator;
  exchange.exchangeAddress = event.params.exchangeAddress;

  let exchangeContract = ExchangeContract.bind(event.params.exchangeAddress);

  let baseToken = Token.load(exchangeContract.baseToken().toHex());
  if (!baseToken) {
    baseToken = new Token(exchangeContract.baseToken().toHex());
  }
  baseToken.symbol = ERC20.bind(exchangeContract.baseToken()).symbol();
  baseToken.name = ERC20.bind(exchangeContract.baseToken()).name();
  baseToken.totalSupply = ERC20.bind(
    exchangeContract.baseToken()
  ).totalSupply();
  baseToken.decimals = BigDecimal.fromString(
    ERC20.bind(exchangeContract.baseToken())
      .decimals()
      .toString()
  );
  baseToken.exchangeFactoryAddress = exchangeContract.exchangeFactoryAddress();
  baseToken.save();

  let quoteToken = Token.load(exchangeContract.quoteToken().toHex());
  if (!quoteToken) {
    quoteToken = new Token(exchangeContract.quoteToken().toHex());
  }
  quoteToken.symbol = ERC20.bind(exchangeContract.quoteToken()).symbol();
  quoteToken.name = ERC20.bind(exchangeContract.quoteToken()).name();
  quoteToken.totalSupply = ERC20.bind(
    exchangeContract.quoteToken()
  ).totalSupply();
  quoteToken.decimals = BigDecimal.fromString(
    ERC20.bind(exchangeContract.quoteToken())
      .decimals()
      .toString()
  );
  quoteToken.exchangeFactoryAddress = exchangeContract.exchangeFactoryAddress();
  quoteToken.save();

  exchange.baseToken = baseToken.id;
  exchange.quoteToken = quoteToken.id;

  // Entities can be written to the store with `.save()`
  exchange.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.exchangeAddressByTokenAddress(...)
  // - contract.feeAddress(...)
  // - contract.isValidExchangeAddress(...)
  // - contract.owner(...)
}

// export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

// export function handleSetFeeAddress(event: SetFeeAddress): void {}
