import random
from datetime import datetime, timedelta

def generar_fecha_nacimiento():
    # Edad mínima y máxima
    edad_minima = 18
    edad_maxima = 40

    # Calcula el año de nacimiento
    año_actual = datetime.now().year
    año_minimo = año_actual - edad_maxima
    año_maximo = año_actual - edad_minima

    # Genera un año de nacimiento aleatorio dentro del rango
    año_nacimiento = random.randint(año_minimo, año_maximo)

    # Genera un mes y un día aleatorios
    mes_nacimiento = random.randint(1, 12)
    if mes_nacimiento == 2:
        # Febrero puede tener 28 o 29 días
        dia_nacimiento = random.randint(1, 29) if año_nacimiento % 4 == 0 else random.randint(1, 28)
    else:
        # Los meses de 30 días
        dias_en_mes = 30 if mes_nacimiento in [4, 6, 9, 11] else 31
        dia_nacimiento = random.randint(1, dias_en_mes)

    # Genera una hora aleatoria
    hora = random.randint(0, 23)
    minuto = random.randint(0, 59)
    segundo = random.randint(0, 59)

    # Crea la fecha y hora
    fecha_nacimiento = datetime(año_nacimiento, mes_nacimiento, dia_nacimiento, hora, minuto, segundo)

    # Formatea la fecha a la cadena deseada
    fecha_formateada = fecha_nacimiento.strftime("%d de %B de %Y, %I:%M:%S %p UTC-3")
    return fecha_formateada

# Genera 10 fechas de nacimiento
fechas = [generar_fecha_nacimiento() for _ in range(10)]

# Imprime las fechas generadas
for fecha in fechas:
    print(fecha)