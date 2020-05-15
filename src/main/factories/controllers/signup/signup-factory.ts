import { SignUpController } from '../../../../presentation/controllers/signup/signup-controller'
import { Controller } from '../../../../presentation/protocols'
import { makeSignUpValidation } from './signup-validation-factory'
import { makeDbAutentication } from '../../usecases/autentication/db-authentication-factory'
import { makeAddAccount } from '../../usecases/add-account/db-add-account-factory'
import { makeLogControllerDecorator } from '../../decorators/log-controller-decorator-factory'

export const makeSignUpController = (): Controller => {
  const controller = new SignUpController(makeAddAccount(), makeSignUpValidation(), makeDbAutentication())
  return makeLogControllerDecorator(controller)
}
