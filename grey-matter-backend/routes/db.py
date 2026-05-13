import psycopg2
import os

password = os.getenv("postgreSQL_password")  

def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="GreyMatterDB",
        user="postgres",
        password=password,
        port=5432
    )