import { MongoHelper } from '../helpers/mongo-helper'
import { AccountMongoRepository } from './account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'

describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    const accountColletion = await MongoHelper.getCollection('accounts')
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

  test('should return ', async () => {
    const { sut, addAccountModel } = makeSut()
    const account = await sut.addAccount(addAccountModel)

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe(addAccountModel.name)
    expect(account.email).toBe(addAccountModel.email)
    expect(account.password).toBe(addAccountModel.password)
  })
})
