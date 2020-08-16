import {Request, Response} from 'express';
import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController{

  async index(request: Request, response: Response){
    const filters = request.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if(!week_day || !subject || !time){
      response.status(400).json({
        error: 'Missing filters to search classes'
      });
    }

    const timeToMinutes = convertHourToMinutes(time);

    const classes = await db('classes')
      .whereExists(function(){
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
          .whereRaw('`class_schedule`.`from` <= ??', [timeToMinutes]);
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'users.id')
      .select(['classes.*', 'users.*']); 

    response.json(classes);
  }

  async create(request: Request, response: Response){
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = request.body;
  
    // Para garantir a integridade de todos os dados inseridos
    const trx = await db.transaction();
  
    try {
      // //await db('').insert({});
      // Substitui o 'db' do knex pela funcão trx que é referente a transection
      const insertedUsrsIds = await trx('users').insert({
        name,
        avatar,
        whatsapp,
        bio,
      });
  
      const user_id = insertedUsrsIds[0];
  
      const insertedClassesID = await trx('classes').insert({
        subject,
        cost,
        user_id,
      });
  
      const class_id = insertedClassesID[0];
  
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
          class_id,
        };
      });
  
      await trx('class_schedule').insert(classSchedule);
  
      await trx.commit();
  
      return response.status(201).send({ message: 'Inserted Sucsses' });
    } catch (error) {
      trx.rollback();
      return response.status(400).send({ error: 'Error' });
    }
  }
}