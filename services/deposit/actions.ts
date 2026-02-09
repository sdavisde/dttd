'use server'

import { authorizedAction } from '@/lib/actions/authorized-action'
import { Permission } from '@/lib/security'
import * as DepositService from './deposit-service'
import { DepositDTO } from './types'

/**
 * Retrieves all deposits from the deposits table.
 * Requires READ_PAYMENTS permission.
 */
export const getAllDeposits = authorizedAction<void, DepositDTO[]>(
  Permission.READ_PAYMENTS,
  async () => {
    return await DepositService.getAllDeposits()
  }
)

/**
 * Retrieves a single deposit by ID.
 * Requires READ_PAYMENTS permission.
 */
export const getDepositById = authorizedAction<string, DepositDTO | null>(
  Permission.READ_PAYMENTS,
  async (id: string) => {
    return await DepositService.getDepositById(id)
  }
)
