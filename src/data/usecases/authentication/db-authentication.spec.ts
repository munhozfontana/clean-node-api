import { AccountModel } from '../../../domain/models/account'
import { LoadAccountByEmailRepository } from '../../protocols/load-account-by-email-repository'
import { DbAuthenticaiton } from './db-authentication'

const makeAccountModel = (): AccountModel => {
  return {
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_password'
  }
}

describe('DbAuthentication UseCase', () => {
  test('should  all LoadAccountByEmailRepository with corret email', async () => {
    class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
      async load (email: string): Promise<AccountModel> {
        return new Promise(resolve => resolve(makeAccountModel()))
      }
    }

    const loadAccountByEmailRepository = new LoadAccountByEmailRepositoryStub()
    const sut = new DbAuthenticaiton(loadAccountByEmailRepository)

    const loadSpy = jest.spyOn(loadAccountByEmailRepository, 'load')

    await sut.auth({ email: 'valid_email@gmail.com', password: 'valid_password' })

    expect(loadSpy).toHaveBeenCalledWith('valid_email@gmail.com')
  })
})
