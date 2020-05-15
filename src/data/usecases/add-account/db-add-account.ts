import { AddAccount, AddAccountModel, AccountModel, Hasher } from './db-add-account-protocols'
import { AddAccountRepository } from '../../protocols/db/account/add-account-repositry'
import { LoadAccountByEmailRepository } from '../authentication/db-authentication-protocols'

export class DbAddAccount implements AddAccount {
  constructor (
    private readonly hasher: Hasher,
    private readonly addAccountRepository: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository
  ) { }

  async add ({ password, email, name }: AddAccountModel): Promise<AccountModel> {
    await this.loadAccountByEmailRepository.loadAccountByEmail(email)
    const hashedPassword = await this.hasher.hash(password)
    const account = await this.addAccountRepository.addAccount({ name, email, password: hashedPassword })
    return new Promise(resolve => resolve(account))
  }
}
