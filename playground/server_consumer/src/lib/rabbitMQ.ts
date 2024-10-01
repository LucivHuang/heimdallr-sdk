import amqp from 'amqplib';

export default class RabbitMQ {
  private readonly hosts: string;
  private readonly count: number;
  constructor(hosts: string, ackNums = 1) {
    this.hosts = `amqp://${hosts}`;
    this.count = ackNums;
  }
  // 消息消费者
  async receiveQueueMsg(queueName: string, receiveCallBack: (data: any) => void, errCallBack: (errMsg: string) => void) {
    try {
      const connection = await amqp.connect(this.hosts);
      const channel = await connection.createChannel();
      await channel.assertQueue(queueName);
      await channel.prefetch(this.count, false);
      await channel.consume(
        queueName,
        (msg) => {
          if (msg !== null) {
            const data = msg.content.toString();
            channel.ack(msg);
            receiveCallBack && receiveCallBack(data);
          } else {
            errCallBack && errCallBack('missing message');
          }
        },
        { noAck: false }
      );
      channel.close();
    } catch (error) {
      errCallBack && errCallBack(error.message);
    }
  }
}
