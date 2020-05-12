import { DbAuthentication } from './db-authentication'
import {
  LoadAccountByEmailRepository,
  AccountModel,
  HashComparer,
  AuthenticationModel,
  Encrypter,
  UpdateAccessTokenRepository
} from './db-authentication-protocols'

interface SutTypes {
  sut: DbAuthentication
  loadAccountByEmailRepository: LoadAccountByEmailRepository
  accountModel: AccountModel
  hashComparer: HashComparer
  authenticationModel: AuthenticationModel
  encrypter: Encrypter
  updateAccessTokenRepository: UpdateAccessTokenRepository

}

const makeSut = (): SutTypes => {
  const authenticationModel = makeAuthenticationModel()
  const loadAccountByEmailRepository = makeLoadAccountByEmailRepository()
  const accountModel = makeAccountModel()
  const hashComparer = makeHashComparer()
  const Encrypter = makeEncrypter()
  const updateAccessTokenRepository = makeUpdateAccessTokenRepository()

  const sut = new DbAuthentication(
    loadAccountByEmailRepository,
    hashComparer,
    Encrypter,
    updateAccessTokenRepository
  )

  return {
    sut,
    loadAccountByEmailRepository,
    accountModel,
    hashComparer,
    authenticationModel,
    encrypter: Encrypter,
    updateAccessTokenRepository
  }
}

const makeAccountModel = (): AccountModel => {
  return {
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_hashed_password'
  }
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadAccountByEmail (_email: string): Promise<AccountModel> {
      return new Promise(resolve => resolve(makeAccountModel()))
    }
  }

  return new LoadAccountByEmailRepositoryStub()
}

const makeAuthenticationModel = (): AuthenticationModel => {
  return { email: 'valid_email@gmail.com', password: 'valid_password' }
}

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return new Promise(resolve => resolve(true))
    }
  }

  return new HashComparerStub()
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (id: string): Promise<string> {
      return new Promise(resolve => resolve('valid_token'))
    }
  }

  return new EncrypterStub()
}

const makeUpdateAccessTokenRepository = (): UpdateAccessTokenRepository => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    async updateAccessToken (id: string, token: string): Promise<void> {
      return new Promise(resolve => resolve())
    }
  }

  return new UpdateAccessTokenRepositoryStub()
}

describe('DbAuthentication UseCase', () => {
  test('should call if LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepository, 'loadAccountByEmail')
    await sut.auth(makeAuthenticationModel())
    expect(loadSpy).toHaveBeenCalledWith('valid_email@gmail.com')
  })

  test('should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    jest.spyOn(loadAccountByEmailRepository, 'loadAccountByEmail').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test('should return null if LoadAccountByEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    jest.spyOn(loadAccountByEmailRepository, 'loadAccountByEmail').mockReturnValueOnce(null)
    const accessToken = await sut.auth(makeAuthenticationModel())
    expect(accessToken).toBeNull()
  })

  test('should call HashComparer with correct values', async () => {
    const { sut, hashComparer, accountModel, authenticationModel } = makeSut()
    const compareSpy = jest.spyOn(hashComparer, 'compare').mockReturnValueOnce(null)
    await sut.auth(authenticationModel)
    expect(compareSpy).toHaveBeenCalledWith(authenticationModel.password, accountModel.password)
  })

  test('should throw if HashComparer throws', async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test('should return null if HashComparer returns false', async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockResolvedValueOnce(false)
    const accessToken = await sut.auth(makeAuthenticationModel())
    expect(accessToken).toBeNull()
  })

  test('should call Encrypter with correct id', async () => {
    const { sut, encrypter: Encrypter, accountModel, authenticationModel } = makeSut()
    const generateSpy = jest.spyOn(Encrypter, 'encrypt')
    await sut.auth(authenticationModel)
    expect(generateSpy).toHaveBeenCalledWith(accountModel.id)
  })

  test('should throw if Encrypter throws', async () => {
    const { sut, encrypter: Encrypter } = makeSut()
    jest.spyOn(Encrypter, 'encrypt').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })

  test('should call Encrypter with correct id', async () => {
    const { sut, authenticationModel } = makeSut()
    const result = await sut.auth(authenticationModel)
    expect(result).toBe('valid_token')
  })

  test('should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, authenticationModel, updateAccessTokenRepository, accountModel } = makeSut()
    const updateSpy = jest.spyOn(updateAccessTokenRepository, 'updateAccessToken')
    await sut.auth(authenticationModel)
    expect(updateSpy).toHaveBeenCalledWith(accountModel.id, 'valid_token')
  })

  test('should throw if UpdateAccessTokenRepository throws', async () => {
    const { sut, updateAccessTokenRepository } = makeSut()
    jest.spyOn(updateAccessTokenRepository, 'updateAccessToken').mockRejectedValueOnce(new Error())
    const promise = sut.auth(makeAuthenticationModel())
    await expect(promise).rejects.toThrow()
  })
})
