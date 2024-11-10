--- instrukcije za pokretanje react-a na frontendu ---
1. npm install
2. npm start
3. npm install cors
   
U rutu react aplikacije, potrebno je kreirati .env fajl, i dodati :

REACT_APP_BACKEND_API_URL=http://localhost:5000


--- instrukcije za pokretanje nodejs-a na backendu --- 
1. npm install
2. node server

U rutu nodejs aplikacije, potrebno je kreirati .env fajl, i dodati : 

CLIENT_ID=862612259511-tmbeukh57rsnr1she10lbq50nni8mad2.apps.googleusercontent.com
CLIENT_SECRET=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
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN=1//04XRFxNfZAQ4ECgYIARAAGAQSNwF-L9IrtdfY-_cAWNWQhMZqjT_uBbIrY8q4DogfMxyDeRWEftkyWniO3T5Xu4RV4ZQkl8P3vZc                                                                          
JWT_SECRET=tv0b7ff9e267dc241a575cb5d36453c17e3139cc46ee8e79e1a1f993c0287b30
ADMIN_PASSWORD=admin                                                                      
DB_PASSWORD=AVNS_4khgT-jGU6QVOcuQvX6                                                                          


Za potrebe projekta korišćena je online baza Aiven console, tako da nije potrebno lokalno podešavati bazu.
