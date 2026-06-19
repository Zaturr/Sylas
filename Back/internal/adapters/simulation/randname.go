package simulation

import (
	"math/rand"
)

var nombresBase = []string{
	"Juan", "Carlos", "Pedro", "Luis", "Jose", "Miguel", "Jesus", "Rafael", "Maria", "Ana", "Carmen", "Rosa", "Elena", "Daniela", "Patricia", "Marta", "Andres", "Alejandro", "Gabriela", "Sofia", "Victor", "Diego", "Victoria", "Valeria",
	"Antonio", "Francisco", "Manuel", "David", "Javier", "Ricardo", "Jorge", "Raul", "Julio", "Cesar", "Oscar", "Orlando", "Eduardo", "Ivan", "Roberto", "Mauricio", "Gabriel", "Christian", "Leonardo", "Arturo", "Kevin",
	"Teresa", "Juana", "Beatriz", "Silvia", "Veronica", "Julia", "Leticia", "Susana", "Lucia", "Laura", "Diana", "Isabella", "Camila", "Mariana", "Valentina", "Barbara", "Miranda", "Paola", "Andrea", "Natalia",
	"Hugo", "Martin", "Lucas", "Mateo", "Joaquin", "Samuel", "Emilio", "Enrique", "Gustavo", "Felipe", "Armando", "Mario", "Hector", "Gerardo", "Ramon", "Pablo", "Tomas", "Ignacio", "Esteban", "Felix", "Alfonso", "Rodrigo", "Guillermo", "Alberto", "Edgar", "Elias", "Marcos", "Ruben", "Simon", "Gonzalo", "Alvaro", "Ernesto", "Ismael", "Lorenzo", "Matias", "Nicolas", "Omar", "Vicente", "Agustin", "Bautista", "Dario", "Ezequiel", "Fabian", "Fidel", "Gilberto", "Hernan", "Humberto", "Leonel",
	"Luisa", "Margarita", "Antonia", "Alicia", "Clara", "Gloria", "Josefina", "Lourdes", "Mercedes", "Norma", "Rosario", "Yolanda", "Blanca", "Consuelo", "Estela", "Guadalupe", "Ines", "Irene", "Luz", "Magdalena", "Pilar", "Raquel", "Rocio", "Soledad", "Amalia", "Angelica", "Belen", "Carolina", "Catalina", "Cecilia", "Celia", "Concepcion", "Dolores", "Elisa", "Emilia", "Esperanza", "Esther", "Eva", "Florencia", "Inmaculada", "Lidia", "Lorena", "Manuela", "Milagros", "Monica", "Nuria", "Paloma", "Remedios", "Rosalia", "Trinidad", "Virginia", "Abigail", "Adriana", "Agueda", "Aida", "Alba", "Alejandra", "Almudena", "Amparo", "Araceli", "Ariadna", "Asuncion", "Aurora", "Begona", "Carlota", "Carmela", "Claudia", "Cristina", "Eloisa", "Elvira", "Encarnacion", "Estefania", "Eugenia", "Eulalia", "Fatima", "Felisa", "Fernanda", "Francisca", "Gema", "Gracia", "Helena", "Isabel", "Jacinta", "Joaquina", "Josefa", "Juliana", "Leonor", "Marina", "Matilde", "Micaela", "Mireia", "Miriam", "Natividad", "Nerea", "Nieves", "Noelia", "Olga", "Paz", "Petra", "Purificacion", "Rebeca", "Regina", "Rosaura", "Sabina", "Sandra", "Sara", "Sonia", "Tomasa", "Vanesa", "Vicenta",
}

var apellidosBase = []string{
	"Perez", "Gonzalez", "Rodriguez", "Gomez", "Fernandez", "Lopez", "Diaz", "Martinez", "Pina", "Gimenez", "Ruiz", "Hernandez", "Mendoza", "Silva", "Alvarez", "Romero", "Quintero", "Acosta", "Rojas", "Medina", "Castillo", "Salazar", "Guzman",
	"Garcia", "Sanchez", "Ramirez", "Torres", "Suarez", "Castro", "Ortiz", "Vargas", "Reyes", "Cruz", "Molina", "Aguilar", "Delgado", "Morales", "Rios", "Navarro", "Campos", "Vega", "Guerrero", "Rivas", "Soto", "Herrera",
	"Paredes", "Cabrera", "Ponce", "Cordova", "Espinoza", "Leon", "Marquez", "Flores", "Ramos", "Chavez", "Cardenas", "Mejia", "Pacheco", "Fuentes", "Carrillo", "Escobar", "Maldonado", "Brito", "Contreras", "Velasquez",
	"Alonso", "Gutierrez", "Dominguez", "Gil", "Blanco", "Serrano", "Ortega", "Rubio", "Marin", "Sanz", "Iglesias", "Nunez", "Garrido", "Cortes", "Lozano", "Cano", "Prieto", "Mendez", "Calvo", "Gallego", "Vidal", "Pena", "Arias", "Montoya", "Salas", "Santana", "Mora", "Pascual", "Velasco", "Valero", "Villanueva", "Navas", "Lorenzo", "Castaneda", "Bermudez", "Benitez", "Aparicio", "Alcala", "Bueno", "Carmona", "Carrasco", "Cobo", "Comas", "Coronado", "Cuevas", "Diez", "Duran", "Esteban", "Franco", "Galan", "Gallo", "Gaspar", "Giraldo", "Gordillo", "Gracia", "Granados", "Guerra", "Guillen", "Heredia", "Hidalgo", "Huertas", "Ibanez", "Izquierdo", "Jaen", "Jimenez", "Jurado", "Lara", "Linares", "Llobet", "Lobo", "Luna", "Macias", "Machado", "Manso", "Marco", "Marcos", "Mares", "Marmol", "Marti", "Mateo", "Mateos", "Matos", "Maya", "Mayor", "Melero", "Mena", "Merino", "Mesa", "Miguel", "Milla", "Millan", "Miro", "Moya", "Munoz", "Murillo", "Nadal", "Naranjo", "Narvaez", "Navarrete", "Nieto", "Ochoa", "Ojeda", "Oliva", "Oliver", "Olmos", "Oramas", "Orozco", "Osuna", "Otero", "Padilla", "Paez", "Palacios", "Palomino", "Pardo", "Parra", "Pastor", "Patino", "Paz", "Pedraza", "Pelayo", "Peralta", "Pino", "Pinto", "Pizarro", "Plaza", "Polo", "Porras", "Portillo", "Pozo", "Prado", "Puente", "Puerta", "Pulido", "Quesada", "Quevedo", "Quintana", "Quiroga", "Raya", "Real", "Rebollo", "Redondo", "Rey", "Rico", "Rincon", "Ripoll", "Rivera", "Rivero", "Robles", "Roca", "Rocha", "Roda", "Rodrigo", "Roldan", "Roman", "Romo", "Roque", "Ros", "Rosa", "Rosales", "Rosario", "Rosas", "Roura", "Rovira", "Royo", "Rueda", "Saavedra", "Saez", "Salcedo", "Salgado", "Salinas", "Salvador", "Samper", "Sanabria", "Sancho", "Sandoval", "Santacruz", "Santamaria", "Santiago", "Santos", "Sarmiento", "Sastre", "Segovia", "Segura", "Sepulveda", "Serna", "Serra", "Sevilla", "Sierra", "Sobrino", "Sola", "Solano", "Soler", "Solis", "Soria", "Soriano", "Sosa", "Taboada", "Talavera", "Tamayo", "Tapia", "Tejada", "Tejera", "Tello", "Tena", "Tenorio", "Teran", "Terron", "Tirado", "Toledo", "Tolosa", "Tomas", "Toro", "Torralba", "Torre", "Tovar", "Trevino", "Trigo", "Trujillo", "Tudela", "Ubeda", "Urbano", "Urena", "Uriarte", "Uribe", "Urrutia", "Urtasun", "Uso", "Valdes", "Valdivia", "Valencia", "Valentin", "Valenzuela", "Valera", "Valle", "Vallejo", "Valls", "Valverde", "Vaquero", "Vara", "Varela", "Vazquez", "Velez", "Vera", "Vergara", "Vicente", "Vila", "Vilchez", "Villa", "Villalba", "Villalobos", "Villar", "Villarreal", "Villarroel", "Villegas", "Villena", "Vives", "Yanez", "Yuste", "Zabaleta", "Zabala", "Zamacona", "Zambrano", "Zamora", "Zapata", "Zaragoza", "Zarate", "Zavala", "Zayas", "Zorrilla", "Zurita",
}

// NameData agrupa los datos generados de una identidad
type NameData struct {
	FullName      string
	FullLastName  string
	BaseFirstName string
	BaseLastName  string
}

// generateRandomName genera una combinación única de dos nombres y dos apellidos
func generateRandomName() NameData {
	n1 := nombresBase[rand.Intn(len(nombresBase))]
	n2 := nombresBase[rand.Intn(len(nombresBase))]
	a1 := apellidosBase[rand.Intn(len(apellidosBase))]
	a2 := apellidosBase[rand.Intn(len(apellidosBase))]

	// Evitar que el primer y segundo nombre/apellido sean idénticos
	if n1 == n2 {
		n2 = nombresBase[(rand.Intn(len(nombresBase))+1)%len(nombresBase)]
	}
	if a1 == a2 {
		a2 = apellidosBase[(rand.Intn(len(apellidosBase))+1)%len(apellidosBase)]
	}

	return NameData{
		FullName:      n1 + " " + n2,
		FullLastName:  a1 + " " + a2,
		BaseFirstName: lowerString(n1),
		BaseLastName:  lowerString(a1),
	}
}

// lowerString convierte una cadena a minúsculas de forma ultrarrápida
func lowerString(s string) string {
	runes := []rune(s)
	for i, r := range runes {
		if r >= 'A' && r <= 'Z' {
			runes[i] = r + 32
		}
	}
	return string(runes)
}
