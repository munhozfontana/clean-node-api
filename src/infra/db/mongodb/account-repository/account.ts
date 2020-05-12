import { AddAccountRepository } from '../../../../data/protocols/db/add-account-repositry'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { AccountModel } from '../../../../domain/models/account'
import { MongoHelper } from '../helpers/mongo-helper'
import { LoadAccountByEmailRepository } from '../../../../data/protocols/db/load-account-by-email-repository'

export class AccountMongoRepository implements AddAccountRepository, LoadAccountByEmailRepository {
  async addAccount (accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    return MongoHelper.map(result.ops[0])
  }

  async loadAccountByEmail (email: string): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const result = await accountCollection.findOne({ email })
    return MongoHelper.map(result)
  }
}
