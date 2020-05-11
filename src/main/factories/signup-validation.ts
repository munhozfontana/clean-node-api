
import { ValidationComposite } from '../../presentation/helper/validators/validation-composite'
import { RequiredFieldValidation } from '../../presentation/helper/validators/required-field-composite'
import { Validation } from '../../presentation/helper/validators/validation'
import { CompareFieldsName } from '../../presentation/helper/validators/compare-fields-validation'
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter'
import { EmailValidation } from '../../presentation/helper/validators/email-validation'

export const makeSignUpValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  const fields: string[] = ['name', 'email', 'password', 'passwordConfirmation']
  for (const field of fields) {
    validations.push(new RequiredFieldValidation(field))
  }

  validations.push(new CompareFieldsName('password', 'passwordConfirmation'))
  validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
  return new ValidationComposite(validations)
}
