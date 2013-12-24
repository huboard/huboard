ddoc = 
  { 
    _id:'plans',
    meta: {
      type: "plans",
      mode: "test"
    },
    stripe: {
      live: {
        User: [{
          id: "user_basic_v1",
          plan_id: "user_basic",
          name: "User",
          amount: 700,
          trial_period: 15
        }],
        Organization: [{
          id: "org_basic_v1",
          plan_id: "org_basic",
          name: "Organization",
          amount: 2400,
          trial_period: 15
        }]
      },
      test: {
        User: [{
          id: "user_basic_v1",
          plan_id: "user_basic",
          name: "User",
          amount: 700,
          trial_period: 15
        }],
        Organization: [{
          id: "org_basic_v1",
          plan_id: "org_basic",
          name: "Organization",
          amount: 2400,
          trial_period: 15
        }]
      }
    }
   
  }
  ;



module.exports = ddoc;
