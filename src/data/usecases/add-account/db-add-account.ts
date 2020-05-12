import { AddAccount, AddAccountModel, AccountModel, Hasher } from './db-add-account-protocols'
import { AddAccountRepository } from '../../protocols/db/account/add-account-repositry'

export class DbAddAccount implements AddAccount {
  private readonly hasher: Hasher
  private readonly addAccountRepository: AddAccountRepository

  constructor (hasher: Hasher, addAccountRepository: AddAccountRepository) {
    this.hasher = hasher
    this.addAccountRepository = addAccountRepository
  }

  async add ({ password, email, name }: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.hasher.hash(password)
    const account = await this.addAccountRepository.addAccount({ name, email, password: hashedPassword })
    return new Promise(resolve => resolve(account))
  }
}
