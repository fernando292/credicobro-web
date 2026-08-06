import { getCredits } from "../../services/credits/creditService";
import { getFollowUps } from "../../services/collection/collectionFollowUpService";



export async function getCalendarEvents(companyId) {

  const [

    credits,

    followUps

  ] = await Promise.all([

    getCredits(companyId),

    getFollowUps(companyId)

  ]);



  const events = [];



  credits.forEach((credit) => {

    if (credit.nextPaymentDate) {

      events.push({

        id: credit.id,

        date: credit.nextPaymentDate,

        type: "payment",

        title: `Cobro - ${credit.client}`,

        client: credit.client,

        amount: credit.installmentValue

      });

    }

  });



  followUps.forEach((item) => {

    events.push({

      id: item.id,

      date: item.date,

      type: "followup",

      title: item.client,

      status: item.status,

      note: item.note

    });

  });



  return events;

}