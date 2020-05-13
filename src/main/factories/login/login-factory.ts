import { Controller } from '../../../presentation/protocols'
import { BcryptAdapter } from '../../../infra/criptography/bcrypt-arapter/bcrypt-adapter'
import { AccountMongoRepository } from '../../../infra/db/mongodb/account/account-mongo-repository'
import { makeLoginValidation } from './login-validation-factory'
import { LogMongoRepository } from '../../../infra/db/mongodb/log/log-mongo-repository'
import { LogControllerDecorator } from '../../decorations/log-controller-decorator'
import { LoginController } from '../../../presentation/controllers/login/login-controller'
import { DbAuthentication } from '../../../data/usecases/authentication/db-authentication'
import { JwtAdapter } from '../../../infra/criptography/jwt-adapter/jwt-adapter'
import env from '../../config/env'

export const makeLoginController = (): Controller => {
  const salt = 12

  const bcryptAdapter = new BcryptAdapter(salt)
  const jwtAdapter = new JwtAdapter(env.jwtSecret)
  const accountMongoRepository = new AccountMongoRepository()
  const dbAuthentication = new DbAuthentication(accountMongoRepository, bcryptAdapter, jwtAdapter, accountMongoRepository)
  const loginController = new LoginController(dbAuthentication, makeLoginValidation())
  const logMongoRepository = new LogMongoRepository()
  return new LogControllerDecorator(loginController, logMongoRepository)
}
