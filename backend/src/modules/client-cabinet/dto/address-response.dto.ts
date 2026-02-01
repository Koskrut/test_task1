export class AddressResponseDto {
  id: string;
  label: string | null;
  country: string;
  region: string | null;
  city: string | null;
  street: string | null;
  house: string | null;
  apartment: string | null;
  postalCode: string | null;
  lat: number | null;
  lng: number | null;
}
