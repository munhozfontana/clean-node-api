import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account-mongo-repository'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { Collection } from 'mongodb'

let accountColletion: Collection

describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountColletion = await MongoHelper.getCollection('accounts')
    await accountColletion.deleteMany({})
  })

  interface TypeSut {
    sut: AccountMongoRepository
    addAccountModel: AddAccountModel
  }

  const makeSut = (): TypeSut => {
    const addAccountModel = makeAddAccountModel()
    const sut = new AccountMongoRepository()

    return {
      addAccountModel,
      sut
    }
  }

  const makeAddAccountModel = (): AddAccountModel => {
    return {
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    }
  }

  test('should return an account on add success', async () => {
    const { sut, addAccountModel } = makeSut()
    const account = await sut.addAccount(addAccountModel)

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe(addAccountModel.name)
    expect(account.email).toBe(addAccountModel.email)
    expect(account.password).toBe(addAccountModel.password)
  })

  test('should return an account on load b success', async () => {
    const { sut, addAccountModel } = makeSut()
    const account = await sut.addAccount(addAccountModel)

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe(addAccountModel.name)
    expect(account.email).toBe(addAccountModel.email)
    expect(account.password).toBe(addAccountModel.password)
  })
  test('should update the account accessToken on updateAccessToken Success', async () => {
    const { sut, addAccountModel } = makeSut()
    const { ops } = await accountColletion.insertOne(addAccountModel)
    await sut.updateAccessToken(ops[0]._id, 'any_token')
    const result = await accountColletion.findOne({ _id: ops[0]._id })
    expect(result).toBeTruthy()
    expect(result.accessToken).toBe('any_token')
  })
})
