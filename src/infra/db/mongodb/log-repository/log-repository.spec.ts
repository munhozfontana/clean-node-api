import { MongoHelper } from '../helpers/mongo-helper'
import { Collection } from 'mongodb'
import { LogMongoRepository } from './log-repository'

describe('Log Mongo Repository', () => {
  let errorColletion: Collection

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    errorColletion = await MongoHelper.getCollection('errors')
    await errorColletion.deleteMany({})
  })

  test('should create an  error log on success ', async () => {
    const sut = new LogMongoRepository()

    await sut.logError('any_error')

    const count = await errorColletion.countDocuments()
    expect(count).toBe(1)
  })
})
