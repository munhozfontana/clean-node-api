
import { makeLoginValidation } from './login-validation-factory'
import { RequiredFieldValidation, EmailValidation, ValidationComposite } from '../../../../validation/validators'
import { EmailValidator } from '../../../../validation/protocols/email-validator'
import { Validation } from '../../../../presentation/protocols/validation'

jest.mock('../../../../validation/validators/validation-composite')

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
