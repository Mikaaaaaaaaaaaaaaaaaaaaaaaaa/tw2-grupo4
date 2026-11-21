export function cumplePoliticaPassword(password: string): boolean {
  const cantidadNumeros = password.match(/\d/g)?.length ?? 0;  // \d busca digitos completos g es global y hace que no pare en la primera coincidencia

  return (
    password.length >= 8 &&
    cantidadNumeros >= 2 &&
    /[a-z]/.test(password) && //Se fija que tenga minusculas
    /[A-Z]/.test(password)    //Se fija que tenga mayusculas
  );
}
