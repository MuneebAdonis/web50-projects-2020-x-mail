document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
 
  // This makes the form submit button do something
  // Either syntax works
  //document.querySelector('#compose-form').addEventListener('submit',send_email);
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});

// function to send the email to someone
function send_email(event){
  // prevent sending of empty stuff with preventDefault
  event.preventDefault();
  // store all the info in variables
  let receiver = document.querySelector('#compose-recipients').value;
  let text_subject = document.querySelector('#compose-subject').value;
  let text_body = document.querySelector('#compose-body').value;
  
  // copy API code
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({recipients: receiver, subject: text_subject, body: text_body})
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  })

  // load sent mailbox
  .then(function(){load_mailbox('sent');})
  
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#single-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#single-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // copy mailbox API code
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      // forEach to loop through
      emails.forEach(each_email => {

        //copy hint function
        const new_email = document.createElement('div');
        new_email.className = "box"
        new_email.innerHTML =
        `<div> From: <b>${each_email.sender}</b> to: <b>${each_email.recipients}</b></div>
        <div> Subject: ${each_email.subject}</div>
        <div> ${each_email.timestamp}</div> `;

        //if that divs email has been read, change the colour to gray
        if (each_email.read == true){new_email.className = "read";}

        // copy new click to link code. edit where needed
        // add open mail function after function() to prevent auto loading
        new_email.addEventListener('click', function() {open_email(each_email.id);}); 
        document.querySelector('#emails-view').append(new_email);
      });
  });
}

function open_email(id){
  document.querySelector('#single-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  // copy and modify fetch code
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // display email
    document.querySelector('#single-view').innerHTML = 
    `<div> From: <b>${email.sender}</b></div>
    <div> To: <b>${email.recipients} </b></div>
    <div> Subject: ${email.subject}</div> 
    <div> ${email.timestamp}</div> 
    <p class = "box">${email.body}</p>`

    //archive button
    const arch = document.createElement('button');
    arch.className ="btn btn-sm btn-outline-primary"
    if(email.archived == false)
    {arch.innerHTML = "archive"; arch.addEventListener ('click', function() {archive(email.id)});}
    else
    {arch.innerHTML = "unarchive";arch.addEventListener('click', function() {unarchive(email.id)});}
    document.querySelector('#single-view').append(arch);
    
     //reply button
     const rep = document.createElement('button');
     rep.className ="btn btn-sm btn-outline-primary"
     rep.innerHTML = "reply"
     rep.addEventListener('click', function(){compose_email()
      document.querySelector('#compose-recipients').value = email.sender;
      if(email.subject.startsWith("Re: ")){document.querySelector('#compose-subject').value = email.subject}
      else{document.querySelector('#compose-subject').value = `Re: ${email.subject}`}
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;})
      document.querySelector('#single-view').append(rep);

;} )

    // update read field
    fetch(`/emails/${id}`, {method: 'PUT', body: JSON.stringify({read: true})})

  //open_email closing tag
  }

function archive(id)
    {fetch(`/emails/${id}`, {method: 'PUT',body: JSON.stringify({archived: true})})
    // dont fully understand this .then syntax but its needed to reload instead of use old values??
    .then(()=> load_mailbox('inbox'));} 
    
function unarchive(id)
    {fetch(`/emails/${id}`, {method: 'PUT',body: JSON.stringify({archived: false})})
    // can use either then function, basically you run a function which calls a function, creates delay?
    //.then(()=> load_mailbox('archive'))}
    .then(function(){load_mailbox('archive')})}