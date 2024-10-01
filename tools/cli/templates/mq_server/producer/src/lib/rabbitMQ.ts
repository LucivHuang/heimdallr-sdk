import amqp from 'amqplib';

export default class RabbitMQ {
  private readonly hosts: string;
  constructor(hosts: string) {
    this.hosts = `amqp://${hosts}`;
  }
  // 消息生产者
  async sendQueueMsg(queueName: string, msg: string) {
    try {
      const connection = await amqp.connect(this.hosts);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName);
      const isSuccess = await channel.sendToQueue(queueName, Buffer.from(msg), { persistent: true });
      channel.close();
      if (isSuccess) {
        return {
          code: 0,
          msg: 'success'
        };
      }
      return {
        code: -1,
        msg: 'failed'
      };
    } catch (error) {
      return {
        code: -1,
        msg: error.message
      };
    }
  }
}
