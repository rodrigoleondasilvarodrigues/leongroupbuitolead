-- Localização do lead e fuso de cada um.
-- O card do lead e o do cliente mostram a hora LOCAL de quem está do outro
-- lado, comparada com Brasília. Sem cidade e estado no lead não havia de onde
-- tirar isso: a cidade vinha do site enterrada dentro de observacoes.
ALTER TABLE leads ADD COLUMN cidade TEXT;
ALTER TABLE leads ADD COLUMN estado TEXT;

-- Override manual do fuso. O mapa de estado para fuso acerta a maioria, mas
-- alguns estados americanos são cortados por dois fusos (Flórida, Texas,
-- Tennessee, Indiana, Kentucky, Michigan, Kansas, Nebraska, Dakotas, Oregon,
-- Idaho, Nevada). Quando o mapa errar, o valor gravado aqui manda.
ALTER TABLE leads ADD COLUMN fuso TEXT;
ALTER TABLE clientes ADD COLUMN fuso TEXT;
