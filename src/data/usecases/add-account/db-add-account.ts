import { AddAccount, AddAccountModel, AccountModel, Encrypter } from './db-add-account-protocols'
import { AddAccountRepository } from '../../protocols/add-account-repositry'

export class DbAddAccount implements AddAccount {
  private readonly encrypter: Encrypter
  private readonly addAccountRepository: AddAccountRepository

  constructor (encrypter: Encrypter, addAccountRepository: AddAccountRepository) {
    this.encrypter = encrypter
    this.addAccountRepository = addAccountRepository
  }

  async add ({ password, email, name }: AddAccountModel): Promise<AccountModel> {
    const hashedPassword = await this.encrypter.encrypt(password)
    await this.addAccountRepository.add({ name, email, password: hashedPassword })
    return new Promise(resolve => resolve(null))
  }
}
