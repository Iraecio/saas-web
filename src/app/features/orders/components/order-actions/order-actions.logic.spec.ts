import { describe, expect, it } from 'vitest';
import { ActionContext, OrderAction, availableOrderActions } from './order-actions.logic';

function ctx(partial: Partial<ActionContext>): ActionContext {
  return {
    status: 'PENDING',
    role: 'CLIENT',
    isOwnerClient: false,
    isAssignedProfessional: false,
    canResolveDispute: false,
    revisionCount: 0,
    maxRevisions: 2,
    deadlinePassed: false,
    ...partial,
  };
}

const sorted = (a: OrderAction[]) => [...a].sort();

describe('availableOrderActions', () => {
  it('PENDING — cliente dono pode cancelar', () => {
    expect(availableOrderActions(ctx({ status: 'PENDING', isOwnerClient: true }))).toEqual(['cancel']);
  });

  it('PENDING — profissional atribuído pode pedir revisão de briefing, aceitar e recusar', () => {
    expect(
      sorted(availableOrderActions(ctx({ status: 'PENDING', isAssignedProfessional: true }))),
    ).toEqual(sorted(['request-brief-revision', 'accept', 'refuse']));
  });

  it('AWAITING_BRIEF — cliente pode atualizar briefing e cancelar', () => {
    expect(
      sorted(availableOrderActions(ctx({ status: 'AWAITING_BRIEF', isOwnerClient: true }))),
    ).toEqual(sorted(['update-brief', 'cancel']));
  });

  it('IN_PROGRESS — profissional entrega; cliente só cancela com prazo excedido', () => {
    expect(availableOrderActions(ctx({ status: 'IN_PROGRESS', isAssignedProfessional: true }))).toEqual(['deliver']);
    expect(availableOrderActions(ctx({ status: 'IN_PROGRESS', isOwnerClient: true, deadlinePassed: false }))).toEqual([]);
    expect(availableOrderActions(ctx({ status: 'IN_PROGRESS', isOwnerClient: true, deadlinePassed: true }))).toEqual(['cancel']);
  });

  it('REVIEW — cliente aprova/dispute e revisa dentro do limite', () => {
    expect(
      sorted(availableOrderActions(ctx({ status: 'REVIEW', isOwnerClient: true, revisionCount: 0, maxRevisions: 2 }))),
    ).toEqual(sorted(['approve', 'request-revision', 'dispute']));
  });

  it('REVIEW — limite de revisões atingido remove request-revision', () => {
    expect(
      sorted(availableOrderActions(ctx({ status: 'REVIEW', isOwnerClient: true, revisionCount: 2, maxRevisions: 2 }))),
    ).toEqual(sorted(['approve', 'dispute']));
  });

  it('REVIEW — profissional pode re-entregar', () => {
    expect(availableOrderActions(ctx({ status: 'REVIEW', isAssignedProfessional: true }))).toEqual(['deliver']);
  });

  it('DISPUTED — somente quem pode resolver vê resolve', () => {
    expect(availableOrderActions(ctx({ status: 'DISPUTED', canResolveDispute: true }))).toEqual(['resolve']);
    expect(availableOrderActions(ctx({ status: 'DISPUTED', isOwnerClient: true }))).toEqual([]);
  });

  it('COMPLETED e CANCELLED — nenhuma ação', () => {
    expect(availableOrderActions(ctx({ status: 'COMPLETED', isOwnerClient: true }))).toEqual([]);
    expect(availableOrderActions(ctx({ status: 'CANCELLED', isAssignedProfessional: true }))).toEqual([]);
  });
});
