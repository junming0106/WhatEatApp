from app import create_app
from app.config import DEBUG

app = create_app()

if __name__ == '__main__':
    app.run(debug=DEBUG, host='0.0.0.0', port=5001) 