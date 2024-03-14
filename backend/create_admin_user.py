from werkzeug.security import generate_password_hash
from main import db  # Import your Flask app and db from the correct module
from main import User  # Import the User model

# Define the username and password
username = 'admin'
plain_password = 'admin'  # You should use a more secure password in production
email = 'admin@example.com'  # Replace with your admin's email

# Hash the password
hashed_password = generate_password_hash(plain_password)

# Check if the user already exists
existing_user = User.query.filter_by(user_name=username).first()

if not existing_user:
    # Create an instance of the User model
    new_user = User(
        user_name=username,
        password=hashed_password,
        email=email
    )
    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()
    print(f'User {username} has been created successfully.')
else:
    print(f'User {username} already exists.')
