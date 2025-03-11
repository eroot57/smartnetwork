import { EventEmitter } from 'node:events';
import type { MoveFunctionVisibility } from '@aptos-labs/ts-sdk';
import { WalletClientBase } from '@goat-sdk/core';
import {
  AddressLookupTableAccount,
  Connection,
  PublicKey,
  TransactionMessage,
  type VersionedTransaction,
} from '@solana/web3.js';
import type { Transaction } from '@solana/web3.js';
import { formatUnits } from 'viem';
import type { WalletClient } from '../types/WalletClient';
import type { SolanaTransaction } from './types';

export type SolanWalletClientCtorParams = {
  connection: Connection;
};

export abstract class SolanaWalletClient extends EventEmitter implements WalletClient {
  [x: string]: any;
  protected connection: Connection;
  protected _publicKey: PublicKey | null = null;
  protected _connected = false;
  protected _connecting = false;

  constructor(
    endpoint: string,
    protected config: {
      commitment?: 'processed' | 'confirmed' | 'finalized';
    } = {}
  ) {
    super();
    this.connection = new Connection(endpoint, config.commitment || 'confirmed');
  }
  signTransaction<
    T extends
      | Transaction
      | (
          | ({ type: string } & {
              hash: string;
              sender: string;
              sequence_number: string;
              max_gas_amount: string;
              gas_unit_price: string;
              expiration_timestamp_secs: string;
              payload:
                | ({ type: string } & {
                    function: string;
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    code: {
                      bytecode: string;
                      abi?: {
                        name: string;
                        visibility: MoveFunctionVisibility;
                        is_entry: boolean;
                        is_view: boolean;
                        generic_type_params: Array<{ constraints: string[] }>;
                        params: string[];
                        return: string[];
                      };
                    };
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    modules: Array<{
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    }>;
                  })
                | ({ type: string } & {
                    multisig_address: string;
                    transaction_payload?: {
                      function: string;
                      type_arguments: string[];
                      arguments: any[];
                    };
                  });
              signature?:
                | ({ type: string } & { public_key: string; signature: string })
                | ({ type: string } & {
                    public_keys: string[];
                    signatures: string[];
                    threshold: number;
                    bitmap: string;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                    fee_payer_address: string;
                    fee_payer_signer:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                  })
                | ({ type: string } & (
                    | ({ type: string } & { public_key: string; signature: string })
                    | ({ type: string } & {
                        public_keys: string[];
                        signatures: string[];
                        threshold: number;
                        bitmap: string;
                      })
                    | ({ type: string } & {
                        public_key: { type: string } & string;
                        signature: { type: string } & string;
                      })
                    | ({ type: string } & {
                        public_keys: Array<{ type: string } & string>;
                        signatures: Array<{ index: number; signature: { type: string } & string }>;
                        signatures_required: number;
                      })
                  ));
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              sender: string;
              sequence_number: string;
              max_gas_amount: string;
              gas_unit_price: string;
              expiration_timestamp_secs: string;
              payload:
                | ({ type: string } & {
                    function: string;
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    code: {
                      bytecode: string;
                      abi?: {
                        name: string;
                        visibility: MoveFunctionVisibility;
                        is_entry: boolean;
                        is_view: boolean;
                        generic_type_params: Array<{ constraints: string[] }>;
                        params: string[];
                        return: string[];
                      };
                    };
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    modules: Array<{
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    }>;
                  })
                | ({ type: string } & {
                    multisig_address: string;
                    transaction_payload?: {
                      function: string;
                      type_arguments: string[];
                      arguments: any[];
                    };
                  });
              signature?:
                | ({ type: string } & { public_key: string; signature: string })
                | ({ type: string } & {
                    public_keys: string[];
                    signatures: string[];
                    threshold: number;
                    bitmap: string;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                    fee_payer_address: string;
                    fee_payer_signer:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                  })
                | ({ type: string } & (
                    | ({ type: string } & { public_key: string; signature: string })
                    | ({ type: string } & {
                        public_keys: string[];
                        signatures: string[];
                        threshold: number;
                        bitmap: string;
                      })
                    | ({ type: string } & {
                        public_key: { type: string } & string;
                        signature: { type: string } & string;
                      })
                    | ({ type: string } & {
                        public_keys: Array<{ type: string } & string>;
                        signatures: Array<{ index: number; signature: { type: string } & string }>;
                        signatures_required: number;
                      })
                  ));
              events: Array<{
                guid: { creation_number: string; account_address: string };
                sequence_number: string;
                type: string;
                data: any;
              }>;
              timestamp: string;
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              payload: { type: string } & {
                write_set:
                  | ({ type: string } & {
                      execute_as: string;
                      script: {
                        code: {
                          bytecode: string;
                          abi?: {
                            name: string;
                            visibility: MoveFunctionVisibility;
                            is_entry: boolean;
                            is_view: boolean;
                            generic_type_params: Array<{ constraints: string[] }>;
                            params: string[];
                            return: string[];
                          };
                        };
                        type_arguments: string[];
                        arguments: any[];
                      };
                    })
                  | ({ type: string } & {
                      changes: Array<
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            module: string;
                          })
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            resource: string;
                          })
                        | ({ type: string } & {
                            state_key_hash: string;
                            handle: string;
                            key: string;
                            data?: { key: any; key_type: string };
                          })
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            data: {
                              bytecode: string;
                              abi?: {
                                address: string;
                                name: string;
                                friends: string[];
                                exposed_functions: Array<{
                                  name: string;
                                  visibility: MoveFunctionVisibility;
                                  is_entry: boolean;
                                  is_view: boolean;
                                  generic_type_params: Array<{ constraints: string[] }>;
                                  params: string[];
                                  return: string[];
                                }>;
                                structs: Array<{
                                  name: string;
                                  is_native: boolean;
                                  abilities: string[];
                                  generic_type_params: Array<{ constraints: string[] }>;
                                  fields: Array<{ name: string; type: string }>;
                                }>;
                              };
                            };
                          })
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            data: { type: string; data: {} };
                          })
                        | ({ type: string } & {
                            state_key_hash: string;
                            handle: string;
                            key: string;
                            value: string;
                            data?: { key: any; key_type: string; value: any; value_type: string };
                          })
                      >;
                      events: Array<{
                        guid: { creation_number: string; account_address: string };
                        sequence_number: string;
                        type: string;
                        data: any;
                      }>;
                    });
              };
              events: Array<{
                guid: { creation_number: string; account_address: string };
                sequence_number: string;
                type: string;
                data: any;
              }>;
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              id: string;
              epoch: string;
              round: string;
              events: Array<{
                guid: { creation_number: string; account_address: string };
                sequence_number: string;
                type: string;
                data: any;
              }>;
              previous_block_votes_bitvec: number[];
              proposer: string;
              failed_proposer_indices: number[];
              timestamp: string;
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              timestamp: string;
            })
        ),
  >(_transaction: T): Promise<T> {
    throw new Error('Method not implemented.');
  }
  sendTransaction<
    T extends
      | Transaction
      | (
          | ({ type: string } & {
              hash: string;
              sender: string;
              sequence_number: string;
              max_gas_amount: string;
              gas_unit_price: string;
              expiration_timestamp_secs: string;
              payload:
                | ({ type: string } & {
                    function: string;
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    code: {
                      bytecode: string;
                      abi?: {
                        name: string;
                        visibility: MoveFunctionVisibility;
                        is_entry: boolean;
                        is_view: boolean;
                        generic_type_params: Array<{ constraints: string[] }>;
                        params: string[];
                        return: string[];
                      };
                    };
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    modules: Array<{
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    }>;
                  })
                | ({ type: string } & {
                    multisig_address: string;
                    transaction_payload?: {
                      function: string;
                      type_arguments: string[];
                      arguments: any[];
                    };
                  });
              signature?:
                | ({ type: string } & { public_key: string; signature: string })
                | ({ type: string } & {
                    public_keys: string[];
                    signatures: string[];
                    threshold: number;
                    bitmap: string;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                    fee_payer_address: string;
                    fee_payer_signer:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                  })
                | ({ type: string } & (
                    | ({ type: string } & { public_key: string; signature: string })
                    | ({ type: string } & {
                        public_keys: string[];
                        signatures: string[];
                        threshold: number;
                        bitmap: string;
                      })
                    | ({ type: string } & {
                        public_key: { type: string } & string;
                        signature: { type: string } & string;
                      })
                    | ({ type: string } & {
                        public_keys: Array<{ type: string } & string>;
                        signatures: Array<{ index: number; signature: { type: string } & string }>;
                        signatures_required: number;
                      })
                  ));
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              sender: string;
              sequence_number: string;
              max_gas_amount: string;
              gas_unit_price: string;
              expiration_timestamp_secs: string;
              payload:
                | ({ type: string } & {
                    function: string;
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    code: {
                      bytecode: string;
                      abi?: {
                        name: string;
                        visibility: MoveFunctionVisibility;
                        is_entry: boolean;
                        is_view: boolean;
                        generic_type_params: Array<{ constraints: string[] }>;
                        params: string[];
                        return: string[];
                      };
                    };
                    type_arguments: string[];
                    arguments: any[];
                  })
                | ({ type: string } & {
                    modules: Array<{
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    }>;
                  })
                | ({ type: string } & {
                    multisig_address: string;
                    transaction_payload?: {
                      function: string;
                      type_arguments: string[];
                      arguments: any[];
                    };
                  });
              signature?:
                | ({ type: string } & { public_key: string; signature: string })
                | ({ type: string } & {
                    public_keys: string[];
                    signatures: string[];
                    threshold: number;
                    bitmap: string;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                  })
                | ({ type: string } & {
                    sender:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                    secondary_signer_addresses: string[];
                    secondary_signers: Array<
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        })
                    >;
                    fee_payer_address: string;
                    fee_payer_signer:
                      | ({ type: string } & { public_key: string; signature: string })
                      | ({ type: string } & {
                          public_keys: string[];
                          signatures: string[];
                          threshold: number;
                          bitmap: string;
                        })
                      | ({ type: string } & {
                          public_key: { type: string } & string;
                          signature: { type: string } & string;
                        })
                      | ({ type: string } & {
                          public_keys: Array<{ type: string } & string>;
                          signatures: Array<{
                            index: number;
                            signature: { type: string } & string;
                          }>;
                          signatures_required: number;
                        });
                  })
                | ({ type: string } & (
                    | ({ type: string } & { public_key: string; signature: string })
                    | ({ type: string } & {
                        public_keys: string[];
                        signatures: string[];
                        threshold: number;
                        bitmap: string;
                      })
                    | ({ type: string } & {
                        public_key: { type: string } & string;
                        signature: { type: string } & string;
                      })
                    | ({ type: string } & {
                        public_keys: Array<{ type: string } & string>;
                        signatures: Array<{ index: number; signature: { type: string } & string }>;
                        signatures_required: number;
                      })
                  ));
              events: Array<{
                guid: { creation_number: string; account_address: string };
                sequence_number: string;
                type: string;
                data: any;
              }>;
              timestamp: string;
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              payload: { type: string } & {
                write_set:
                  | ({ type: string } & {
                      execute_as: string;
                      script: {
                        code: {
                          bytecode: string;
                          abi?: {
                            name: string;
                            visibility: MoveFunctionVisibility;
                            is_entry: boolean;
                            is_view: boolean;
                            generic_type_params: Array<{ constraints: string[] }>;
                            params: string[];
                            return: string[];
                          };
                        };
                        type_arguments: string[];
                        arguments: any[];
                      };
                    })
                  | ({ type: string } & {
                      changes: Array<
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            module: string;
                          })
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            resource: string;
                          })
                        | ({ type: string } & {
                            state_key_hash: string;
                            handle: string;
                            key: string;
                            data?: { key: any; key_type: string };
                          })
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            data: {
                              bytecode: string;
                              abi?: {
                                address: string;
                                name: string;
                                friends: string[];
                                exposed_functions: Array<{
                                  name: string;
                                  visibility: MoveFunctionVisibility;
                                  is_entry: boolean;
                                  is_view: boolean;
                                  generic_type_params: Array<{ constraints: string[] }>;
                                  params: string[];
                                  return: string[];
                                }>;
                                structs: Array<{
                                  name: string;
                                  is_native: boolean;
                                  abilities: string[];
                                  generic_type_params: Array<{ constraints: string[] }>;
                                  fields: Array<{ name: string; type: string }>;
                                }>;
                              };
                            };
                          })
                        | ({ type: string } & {
                            address: string;
                            state_key_hash: string;
                            data: { type: string; data: {} };
                          })
                        | ({ type: string } & {
                            state_key_hash: string;
                            handle: string;
                            key: string;
                            value: string;
                            data?: { key: any; key_type: string; value: any; value_type: string };
                          })
                      >;
                      events: Array<{
                        guid: { creation_number: string; account_address: string };
                        sequence_number: string;
                        type: string;
                        data: any;
                      }>;
                    });
              };
              events: Array<{
                guid: { creation_number: string; account_address: string };
                sequence_number: string;
                type: string;
                data: any;
              }>;
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              id: string;
              epoch: string;
              round: string;
              events: Array<{
                guid: { creation_number: string; account_address: string };
                sequence_number: string;
                type: string;
                data: any;
              }>;
              previous_block_votes_bitvec: number[];
              proposer: string;
              failed_proposer_indices: number[];
              timestamp: string;
            })
          | ({ type: string } & {
              version: string;
              hash: string;
              state_change_hash: string;
              event_root_hash: string;
              state_checkpoint_hash?: string;
              gas_used: string;
              success: boolean;
              vm_status: string;
              accumulator_root_hash: string;
              changes: Array<
                | ({ type: string } & { address: string; state_key_hash: string; module: string })
                | ({ type: string } & { address: string; state_key_hash: string; resource: string })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    data?: { key: any; key_type: string };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: {
                      bytecode: string;
                      abi?: {
                        address: string;
                        name: string;
                        friends: string[];
                        exposed_functions: Array<{
                          name: string;
                          visibility: MoveFunctionVisibility;
                          is_entry: boolean;
                          is_view: boolean;
                          generic_type_params: Array<{ constraints: string[] }>;
                          params: string[];
                          return: string[];
                        }>;
                        structs: Array<{
                          name: string;
                          is_native: boolean;
                          abilities: string[];
                          generic_type_params: Array<{ constraints: string[] }>;
                          fields: Array<{ name: string; type: string }>;
                        }>;
                      };
                    };
                  })
                | ({ type: string } & {
                    address: string;
                    state_key_hash: string;
                    data: { type: string; data: {} };
                  })
                | ({ type: string } & {
                    state_key_hash: string;
                    handle: string;
                    key: string;
                    value: string;
                    data?: { key: any; key_type: string; value: any; value_type: string };
                  })
              >;
              timestamp: string;
            })
        ),
  >(_transaction: T): Promise<string> {
    throw new Error('Method not implemented.');
  }

  get chainId(): string {
    return 'solana';
  }

  get address(): string | null {
    return this._publicKey?.toBase58() || null;
  }

  get connected(): boolean {
    return this._connected;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signMessage(message: string | Uint8Array): Promise<string>;
  //abstract signTransaction<T extends SolanaTransaction>(transaction: T): Promise<T>;
  //abstract sendTransaction<T extends SolanaTransaction>(transaction: T): Promise<string>;

  protected async prepareTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this._publicKey) throw new Error('Wallet not connected');

    const latestBlockhash = await this.connection.getLatestBlockhash();
    transaction.feePayer = this._publicKey;
    transaction.recentBlockhash = latestBlockhash.blockhash;

    return transaction;
  }

  getChain() {
    return {
      type: 'solana',
    } as const;
  }

  getConnection() {
    return this.connection;
  }

  async balanceOf(address: string) {
    const pubkey = new PublicKey(address);
    const balance = await this.connection.getBalance(pubkey);

    return {
      decimals: 9,
      symbol: 'SOL',
      name: 'Solana',
      value: formatUnits(BigInt(balance), 9),
      inBaseUnits: balance.toString(),
    };
  }

  async decompileVersionedTransactionToInstructions(versionedTransaction: VersionedTransaction) {
    const lookupTableAddresses = versionedTransaction.message.addressTableLookups.map(
      (lookup) => lookup.accountKey
    );
    const addressLookupTableAccounts = await Promise.all(
      lookupTableAddresses.map((address) =>
        this.connection.getAddressLookupTable(address).then((lookupTable) => lookupTable.value)
      )
    );
    const nonNullAddressLookupTableAccounts = addressLookupTableAccounts.filter(
      (lookupTable) => lookupTable != null
    );
    const decompileArgs = {
      addressLookupTableAccounts: nonNullAddressLookupTableAccounts,
    };
    return TransactionMessage.decompile(versionedTransaction.message, decompileArgs).instructions;
  }

  protected async getAddressLookupTableAccounts(
    keys: string[]
  ): Promise<AddressLookupTableAccount[]> {
    const addressLookupTableAccountInfos = await this.connection.getMultipleAccountsInfo(
      keys.map((key) => new PublicKey(key))
    );

    return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
      const addressLookupTableAddress = keys[index];
      if (accountInfo) {
        const addressLookupTableAccount = new AddressLookupTableAccount({
          key: new PublicKey(addressLookupTableAddress),
          state: AddressLookupTableAccount.deserialize(accountInfo.data),
        });
        acc.push(addressLookupTableAccount);
      }

      return acc;
    }, new Array<AddressLookupTableAccount>());
  }
}
