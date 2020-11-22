# Consigne d’installation :	
1.	Dans PostgreSQL crée une nouvelle base donnée et lui donnée le nom *fruit-store*

2.	Importer la base de données fournis en faisant un clic droit sur la base donnée puis en utilisant la fonction *restore*.

3.	Dans le fichier `server/routes/api` à la ligne 11, inscrire le mot de passe admin de votre base de données local.

4.	Installer les modules nécessaires au fonctionnement avec la commande suivante dans la console PowerShell ouverte à la racine du projet :
     ```
    npm install express bcrypt axios
    ```

5.	Lancer le site avec la commande   
    ```
    npm start
    ```

6.	Accéder au site en cliquant sur le [lien](http://localhost:3000/#/) ou depuis un navigateur à l’adresse local suivante http://localhost:3000/#/