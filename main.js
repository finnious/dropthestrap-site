/* ============================================
   DROP THE STRAP MARKETING — main.js
   Nav · FAQ · Analytics · Forms · Fade-in
   ============================================ */

/* --- Mobile Nav Toggle --- */
(function(){
  var t=document.getElementById('nav-toggle'),m=document.getElementById('mobile-menu');
  if(t&&m){t.addEventListener('click',function(){t.classList.toggle('open');m.classList.toggle('open')})}
  document.querySelectorAll('.mobile-menu a').forEach(function(a){a.addEventListener('click',function(){t.classList.remove('open');m.classList.remove('open')})});
})();

/* --- FAQ Accordion --- */
document.querySelectorAll('.faq-q').forEach(function(q){
  q.addEventListener('click',function(){
    var item=q.parentElement;
    var wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function(i){i.classList.remove('open')});
    if(!wasOpen) item.classList.add('open');
  });
});

/* --- Deferred Analytics: Clicky + GA4 sendBeacon --- */
(function(){
  function loadAnalytics(){
    /* Clicky — standard init pattern with deferred loading
       Uses clicky.init() which properly registers the clicky object
       for pageview tracking, goals, and event logging */
    if(typeof window.CLICKY_SITE_ID!=='undefined'){
      var cs=document.createElement('script');
      cs.async=true;
      cs.src='//static.getclicky.com/js';
      cs.onload=function(){
        try{clicky.init(window.CLICKY_SITE_ID)}catch(e){}
      };
      document.body.appendChild(cs);
    }
    /* GA4 via sendBeacon — lightweight, no gtag.js */
    if(typeof window.GA4_ID!=='undefined'&&navigator.sendBeacon){
      var p=new URLSearchParams({v:'2',tid:window.GA4_ID,cid:Math.random().toString(36).substring(2)+'.'+Date.now(),en:'page_view',dl:location.href,dt:document.title,dr:document.referrer,ul:navigator.language||'',sr:screen.width+'x'+screen.height});
      navigator.sendBeacon('https://www.google-analytics.com/g/collect',p);
    }
  }
  if(document.readyState==='complete'){setTimeout(loadAnalytics,100)}
  else{window.addEventListener('load',function(){setTimeout(loadAnalytics,100)})}
})();

/* --- Fade-in on Scroll --- */
(function(){
  if(!('IntersectionObserver' in window)) return;
  var els=document.querySelectorAll('.fade-in');
  if(!els.length) return;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
  },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
  els.forEach(function(el){obs.observe(el)});
})();

/* --- Contact Form Handler --- */
(function(){
  var form=document.getElementById('dts-contact-form');
  if(!form) return;

  form.addEventListener('submit',async function(e){
    e.preventDefault();

    var btn=form.querySelector('button[type="submit"]');
    var errDiv=document.getElementById('form-error');
    var successDiv=document.getElementById('form-success');
    errDiv.style.display='none';
    successDiv.style.display='none';

    var firstName=form.querySelector('#first_name').value.trim();
    var email=form.querySelector('#email').value.trim();
    var businessDoes=form.querySelector('#business_does')?.value.trim()||'';
    var idealCustomer=form.querySelector('#ideal_customer')?.value.trim()||'';
    var becomeCustomer=form.querySelector('#become_customer')?.value.trim()||'';
    var urlField=form.querySelector('#business_url');
    var businessUrl=(urlField&&urlField.value||'').trim();
    if(businessUrl&&!/^https?:\/\//i.test(businessUrl)){
      businessUrl='https://'+businessUrl;
      urlField.value=businessUrl;
    }

    if(!firstName||!email||!businessDoes||!idealCustomer||!becomeCustomer){
      errDiv.textContent='Name, email, and the three business questions are required.';
      errDiv.style.display='block';
      return;
    }

    btn.disabled=true;
    var origText=btn.textContent;
    btn.textContent='Submitting...';

    /* Build payload — who-you-serve fields mapped to existing GHL custom field IDs */
    var phone=form.querySelector('#phone')?.value.trim()||'';

    var payload={
      first_name:firstName,
      last_name:'',
      email:email,
      source:'DTS Website - Who You Serve',
      tags:['DTS-Website-Lead','DTS-Who-You-Serve']
    };

    if(phone) payload.phone=phone;

    payload.customFields=[];
    payload.customFields.push({id:'CB6C0Pftq3iBazSNAGn7',field_value:businessDoes});
    payload.customFields.push({id:'g3zBs1d6Gmpiqwu5StKI',field_value:idealCustomer});
    payload.customFields.push({id:'YVnf84CYQYzvyEnKsji5',field_value:becomeCustomer});
    if(businessUrl) payload.customFields.push({id:'quK2obCsKpq7QiigwRxt',field_value:businessUrl});
    if(document.getElementById('sms_transactional')&&document.getElementById('sms_transactional').checked) payload.tags.push('DTS-SMS-Transactional');
    if(document.getElementById('sms_marketing')&&document.getElementById('sms_marketing').checked) payload.tags.push('DTS-SMS-Marketing');

    try{
      var resp=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      var result=await resp.json();
      if(result.success){
        form.style.display='none';
        successDiv.style.display='block';
        successDiv.textContent='Received. We review. We don’t take the keys.';
        /* Track form submission — goal + event for redundancy */
        try{
          if(typeof clicky!=='undefined'&&typeof clicky.goal==='function'){
            clicky.goal('Contact Form Submitted');
          }
          if(typeof clicky!=='undefined'&&typeof clicky.log==='function'){
            clicky.log('#contact/form-submit','Contact Form Submitted');
          }
        }catch(e){}
      }else{
        errDiv.textContent='Something went wrong. Try again or email us directly.';
        errDiv.style.display='block';
        btn.disabled=false;btn.textContent=origText;
      }
    }catch(err){
      errDiv.textContent='Connection error. Please try again.';
      errDiv.style.display='block';
      btn.disabled=false;btn.textContent=origText;
    }
  });
})();
