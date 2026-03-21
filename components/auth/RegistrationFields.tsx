import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GenderToggle } from '@/components/ui/gender-toggle'

interface RegistrationFieldsProps {
  firstName: string
  setFirstName: (value: string) => void
  lastName: string
  setLastName: (value: string) => void
  gender: 'male' | 'female' | null
  setGender: (value: 'male' | 'female') => void
}

export default function RegistrationFields({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  gender,
  setGender,
}: RegistrationFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            autoComplete="given-name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            autoComplete="family-name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Gender</Label>
        <GenderToggle value={gender} onChange={setGender} />
      </div>
    </>
  )
}
