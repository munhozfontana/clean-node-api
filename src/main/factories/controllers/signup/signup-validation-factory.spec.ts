import { RequiredFieldValidation, CompareFieldsValidation, EmailValidation, ValidationComposite } from '../../../../presentation/helper/validators'
import { EmailValidator } from '../../../../presentation/protocols/email-validator'
import { Validation } from '../../../../presentation/protocols/validation'
import { makeSignUpValidation } from './signup-validation-factory'

jest.mock('../../../../presentation/helper/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (_email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const validations: Validation[] = []
const fields: string[] = ['name', 'email', 'password', 'passwordConfirmation']

describe('SignUpValidation Factory', () => {
  test('should Call ValidationComposite with all validations', () => {
    makeSignUpValidation()

    for (const field of fields) {
      validations.push(new RequiredFieldValidation(field))
    }

    validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
    validations.push(new EmailValidation('email', makeEmailValidator()))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
