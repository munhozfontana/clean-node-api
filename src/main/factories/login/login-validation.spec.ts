
import { ValidationComposite } from '../../../presentation/helper/validators/validation-composite'
import { Validation } from '../../../presentation/helper/validators/validation'
import { RequiredFieldValidation } from '../../../presentation/helper/validators/required-field-composite'
import { EmailValidation } from '../../../presentation/helper/validators/email-validation'
import { EmailValidator } from '../../../presentation/protocols/email-validator'
import { makeLoginValidation } from './login-validation'

jest.mock('../../../presentation/helper/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (_email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const validations: Validation[] = []
const fields: string[] = ['email', 'password']

describe('LoginValidation Factory', () => {
  test('should Call ValidationComposite with all validations', () => {
    makeLoginValidation()

    for (const field of fields) {
      validations.push(new RequiredFieldValidation(field))
    }

    validations.push(new EmailValidation('email', makeEmailValidator()))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
