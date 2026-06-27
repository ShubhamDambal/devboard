from app import create_app, db

app = create_app()

with app.app_context():
    db.create_all()  #create table if they don't exist yet

if __name__ == "__main__":
    app.run(debug=True, port=5000)