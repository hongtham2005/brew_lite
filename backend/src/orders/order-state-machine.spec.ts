import { OrderStatus, OrderStateMachine } from './order-state-machine';

describe('OrderStateMachine', () => {
  const validTransitions: Partial<Record<OrderStatus, OrderStatus[]>> = {
    [OrderStatus.PENDING]: [
      OrderStatus.PAID,
      OrderStatus.PAYMENT_FAILED,
      OrderStatus.CANCELLED,
    ],
    [OrderStatus.PAYMENT_FAILED]: [OrderStatus.PENDING, OrderStatus.CANCELLED],
    [OrderStatus.PAID]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY],
    [OrderStatus.READY]: [OrderStatus.COMPLETED],
  };

  it('allows every transition defined by the state machine', () => {
    for (const currentStatus of Object.values(OrderStatus)) {
      for (const targetStatus of validTransitions[currentStatus] ?? []) {
        expect(() =>
          OrderStateMachine.assertTransition(currentStatus, targetStatus),
        ).not.toThrow();
      }
    }
  });

  it('blocks every transition not defined by the state machine', () => {
    const statuses = Object.values(OrderStatus);

    for (const currentStatus of statuses) {
      for (const targetStatus of statuses) {
        if (validTransitions[currentStatus]?.includes(targetStatus)) {
          continue;
        }

        expect(() =>
          OrderStateMachine.assertTransition(currentStatus, targetStatus),
        ).toThrow();
      }
    }
  });
});