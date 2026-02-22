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
    /* Clicky — Site ID 101416291 */
    if(typeof window.CLICKY_SITE_ID!=='undefined'){
      var cs=document.createElement('script');
      cs.async=true;cs.src='//static.getclicky.com/js';
      document.body.appendChild(cs);
      window.clicky_site_ids=window.clicky_site_ids||[];
      window.clicky_site_ids.push(window.CLICKY_SITE_ID);
    }
    /* GA4 via sendBeacon — Measurement ID G-G4BZTKG18M */
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
    var lastName=form.querySelector('#last_name')?.value.trim()||'';
    var email=form.querySelector('#email').value.trim();

    if(!firstName||!email){
      errDiv.textContent='Name and email are required.';
      errDiv.style.display='block';
      return;
    }

    btn.disabled=true;
    var origText=btn.textContent;
    btn.textContent='Submitting...';

    /* Build payload */
    var phone=form.querySelector('#phone')?.value.trim()||'';
    var businessName=form.querySelector('#business_name')?.value.trim()||'';
    var businessUrl=form.querySelector('#business_url')?.value.trim()||'';
    var whatSell=form.querySelector('#what_sell')?.value.trim()||'';
    var challenge=form.querySelector('#challenge')?.value.trim()||'';
    var prevSeo=form.querySelector('#prev_seo')?.value.trim()||'';
    var success6=form.querySelector('#success_6mo')?.value.trim()||'';
    var budget=form.querySelector('#budget')?.value||'';
    var hearAbout=form.querySelector('#hear_about')?.value.trim()||'';
    // SMS consent handled via checkboxes below

    var payload={
      first_name:firstName,
      last_name:lastName,
      email:email,
      source:'DTS Website - Contact Form',
      tags:['DTS-Website-Lead','DTS-Contact']
    };

    if(phone) payload.phone=phone;

    /* Map open-text fields to GHL custom fields — IDs configured in GHL */
    payload.customFields=[];
    if(businessName) payload.customFields.push({id:'XZpGQTm7YUptsXfTwb3h',field_value:businessName});
    if(businessUrl) payload.customFields.push({id:'quK2obCsKpq7QiigwRxt',field_value:businessUrl});
    if(whatSell) payload.customFields.push({id:'CB6C0Pftq3iBazSNAGn7',field_value:whatSell});
    if(challenge) payload.customFields.push({id:'g3zBs1d6Gmpiqwu5StKI',field_value:challenge});
    if(prevSeo) payload.customFields.push({id:'HOcOg3xYNF7dCddAza8h',field_value:prevSeo});
    if(success6) payload.customFields.push({id:'YVnf84CYQYzvyEnKsji5',field_value:success6});
    if(budget) payload.customFields.push({id:'cleCpHNcdpUnbh1moljS',field_value:budget});
    if(hearAbout) payload.customFields.push({id:'R1zAb8wUz8lvTecuKQqN',field_value:hearAbout});
    if(document.getElementById('sms_transactional')&&document.getElementById('sms_transactional').checked) payload.tags.push('DTS-SMS-Transactional');
    if(document.getElementById('sms_marketing')&&document.getElementById('sms_marketing').checked) payload.tags.push('DTS-SMS-Marketing');

    try{
      var resp=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      var result=await resp.json();
      if(result.success){
        form.style.display='none';
        successDiv.style.display='block';
        successDiv.textContent="Submission received. We review every form within 48 hours. If there's a fit, you'll hear from us.";
        /* Track form submission in Clicky */
        if(typeof clicky!=='undefined'){clicky.goal('form_submit')}
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
