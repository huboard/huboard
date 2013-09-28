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
          id: "user_basic_v1",
          plan_id: "user_basic",
          name: "User",
          amount: 700,
          trail_period: 180
        }],
        Organization: [{
          id: "org_basic_v1",
          plan_id: "org_basic",
          name: "Organization",
          amount: 2400,
          trail_period: 180
        }]
      }
    }
   
  }
  ;



module.exports = ddoc;
