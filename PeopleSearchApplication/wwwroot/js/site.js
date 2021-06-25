const uri = 'api/SearchPeople';
let Searchs = [];

//This function fetches the people stored in C# and gives them to the display people function.
function getPeople() {
    fetch(uri)
        .then(response => response.json())
        .then(data => _displayPeople(data))
        .catch(error => console.error('Unable to get people.', error));
}

//This function reads the data inputted in the add/update people tab.  It constructs the person object that will be sent to C#.
function getPersonInfo() {
    //addMes displays various status messages after an attempt to add or update a person
    document.getElementById('addMes').innerHTML = "";

    const fNameTextbox = document.getElementById('fname');
    const lNameTextbox = document.getElementById('lname');
    const streetTextbox = document.getElementById('addressStreet');
    const zipTextbox = document.getElementById('addressZip');
    const cityTextbox = document.getElementById('addressCity');
    const stateTextbox = document.getElementById('addressState');
    const ageTextbox = document.getElementById('age');
    const interestsTextbox = document.getElementById('interests');

    var picture = document.getElementById('picture');

    //Store the URL of the picture uploaded for future display
    if (picture.files.length !== 0) {
        picture.onload = () => {
            URL.revokeObjectURL(picture.src);
        }

        picture.src = URL.createObjectURL(picture.files[0]);
    } else {
        picture.src = "";
    }

    const person = {
        //Trim each of the strings to remove unnecessary whitespace
        name: fNameTextbox.value.trim() + " " + lNameTextbox.value.trim(),
        //Storing the entire address in a string because structure is known (Street, City, State, Zip)
        address: streetTextbox.value.trim() + ", " + cityTextbox.value.trim() + ", " + stateTextbox.value.trim() + ", " + zipTextbox.value.trim(),
        age: ageTextbox.value.trim(),
        interests: interestsTextbox.value.trim(),
        pictureurl: picture.src,
    };

    return person;
}

//This function is called whenever the add/update button in the first tab is pressed.
function addPerson() {
    const person = getPersonInfo();

    if (isNaN(person.age) || person.age < 0 || person.age > 130) {
        document.getElementById('addMes').innerHTML = "Age must be a number between 0 and 130";
    } else {
        fetch(uri)
            .then(response => response.json())
            .then(data => addPersonInDb(data, person))
            .catch(error => console.error('Unable to get people.', error));
    }
}

//This function checks to see whether the person is in the database already.  If both their name and address are in the database,
//we consider this a represented person.  If there is a change in age, interest, or picture, we update the person in the database but do not
//create a duplicate entry.  If their name is in the database but their address is different, we consider this a new person and add them without
//removing the original entry.
function addPersonInDb(data, personToAdd) {
    var personAlreadyInDb = false;
    var personUpdate = false;
    data.forEach(person => {
        if (person.name.valueOf() == personToAdd.name.valueOf()
                && person.address.valueOf() == personToAdd.address.valueOf()) {
            personAlreadyInDb = true;

            if (person.age.valueOf() != personToAdd.age.valueOf()
                || person.interests.valueOf() != personToAdd.interests.valueOf()
                || person.pictureurl.valueOf() != personToAdd.pictureurl.valueOf()) {
                personUpdate = true;

                //Delete the old entry to avoid repeated people
                deletePerson(person.id)
            }
        }
    })

    if (personAlreadyInDb == false || personUpdate) {
        fetch(uri, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(personToAdd)
        })
            .then(response => response.json())
            .then(() => {
                getPeople();
            })
            .catch(error => console.error('Unable to add person.', error));
        if (personUpdate) {
            document.getElementById('addMes').innerHTML = personToAdd.name + " updated!";
        } else {
            document.getElementById('addMes').innerHTML = personToAdd.name + " successfully added!";
        }
    } else {
        document.getElementById('addMes').innerHTML = "This person is already in the database";
    }
}

//Deletes a specific entry from the database
function deletePerson(id) {
    fetch(`${uri}/${id}`, {
        method: 'DELETE'
    })
        .then(() => getPeople())
        .catch(error => console.error('Unable to delete person.', error));
}

//Displays a count of people in database, shown on the top right of the screen.
function _displayCount(PersonCount) {
    const personPlural = (PersonCount === 1) ? 'person' : 'people';
    const isAre = (PersonCount === 1) ? 'is' : 'are';

    document.getElementById('counter').innerText = "There " + isAre + " currently " + `${PersonCount} ${personPlural}` + " in the database";
}

//This function manages the table containing all the people in the search tab.
function _displayPeople(data) {
    const pTable = document.getElementById('peopleList');
    pTable.innerHTML = '';

    const searchTextbox = document.getElementById('searchParam');
    var searchKey = searchTextbox.value.trim();
    var searchKeyLower = searchKey.toLowerCase();

    //If nobody matches search criteria, add flag to display None Found message after search
    var personFound = false;
    document.getElementById('noneFound').innerHTML = "";

    _displayCount(data.length);

    const button = document.createElement('button');

    data.forEach(person => {
        var nameLower = person.name.toLowerCase();
        var loader = document.getElementById('loader');

        //If there is no search key, display every entry in the database.  However, if there is a non
        //zero search key, only display the people whose names contain the key at some point.
        if (!searchKey || searchKey.length === 0
            || nameLower.indexOf(searchKeyLower) != -1) {
            personFound = true;

            let deleteButton = button.cloneNode(false);
            deleteButton.innerText = 'Delete';
            deleteButton.setAttribute('onclick', `deletePerson(${person.id})`);

            let tr = pTable.insertRow();

            let imgNode = document.createElement('img');
            imgNode.src = person.pictureurl;
            tr.insertCell(0).appendChild(imgNode);


            let textNode = document.createTextNode(person.name);
            tr.insertCell(1).appendChild(textNode);
           
            textNode = document.createTextNode(person.address);
            tr.insertCell(2).appendChild(textNode);

            textNode = document.createTextNode(person.age);
            tr.insertCell(3).appendChild(textNode);

            textNode = document.createTextNode("");
            if (person.interests && person.interests.length !== 0) {
                textNode = document.createTextNode(person.interests);
            } 
            tr.insertCell(4).appendChild(textNode);

            tr.insertCell(5).appendChild(deleteButton);

            loader.style.display = "none";
        }
    });

    if (personFound == false && data.length != 0) {
        loader.style.display = "none";
        document.getElementById('noneFound').innerHTML = "Nobody matched the search criteria!";
    } else if (data.length == 0 && (searchKey && searchKey.length !== 0)) {
        document.getElementById('noneFound').innerHTML = "No entries in the database!";
    }
}

//Function called by the search button.  Uses getPeople to fetch data and call the display people function.  Calls immediately when
//slow simulation is not active, waits 5 seconds when slow sim is toggled on.
function searchPeople() {
    //Check if the slow switch is toggled
    if (document.getElementById('slowSwitch').checked) {
        //Clear display
        document.getElementById('peopleList').innerHTML = '';

        var loader = document.getElementById('loader');
        loader.style.display = "block";
        setTimeout(() => { getPeople() } , 5000);
    } else {
        getPeople();
    }
}

//Manages the active tab.  Called by both tabs.
function chooseTab(tab, elmnt, color) {
    var tabContent = document.getElementsByClassName("tabContent");
    var tabButtons = document.getElementsByClassName("tabButton");
    document.getElementById('noneFound').innerHTML = '';
    document.getElementById('addMes').innerHTML = '';
    for (var i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].style.backgroundColor = "#D3D3D3";
    }

    document.getElementById(tab).style.display = "block";
    elmnt.style.backgroundColor = color;
}
