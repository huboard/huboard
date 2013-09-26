ddoc = 
  { 
    _id:'plans',
    meta: {
      type: "plans",
      mode: "test"
    },
    stripe: {
      test: {
        User: [{
          id: "user_basic",
          plan_id: "user_basic",
          name: "User",
          amount: 700
        }],
        Organization: [{
          id: "org_basic",
          plan_id: "org_basic",
          name: "Organization",
          amount: 2400
        }]
      }
    }
   
  }
  ;



module.exports = ddoc;