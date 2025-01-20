import mysql.connector
from faker import Faker
from tqdm import tqdm

fake = Faker()

# Connect to MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="yourpassword",
    database="performance_test"
)
cursor = conn.cursor()

# Insert 40M users
batch_size = 10000
total_rows = 40000000

for _ in tqdm(range(total_rows // batch_size)):
    users = [
        (fake.name(), fake.date_of_birth(minimum_age=18, maximum_age=90))
        for _ in range(batch_size)
    ]
    cursor.executemany(
        "INSERT INTO users (name, date_of_birth) VALUES (%s, %s)",
        users
    )
    conn.commit()

cursor.close()
conn.close()