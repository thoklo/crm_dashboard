import { faker } from '@faker-js/faker';

export function generateCustomers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    status: faker.helpers.arrayElement(["Active", "Inactive"]),
  }));
}
