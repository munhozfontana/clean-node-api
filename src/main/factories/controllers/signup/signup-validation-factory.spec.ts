import { makeSignUpValidation } from '../../../../main/factories/controllers/signup/signup-validation-factory'

import { RequiredFieldValidation, CompareFieldsValidation, EmailValidation, ValidationComposite } from '../../../../validation/validators'
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
