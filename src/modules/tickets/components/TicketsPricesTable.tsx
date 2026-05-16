import { Fragment } from 'react';
import { ticketsPricesSeason2026 } from '@/modules/shared/data/tickets-content';

export default function TicketsPricesTable() {
  return (
    <div className="tickets-page__prices-table-wrap">
      <table className="tickets-page__prices-table">
        <thead>
          <tr>
            <th scope="col">Сектор</th>
            <th scope="col">Стандартный</th>
            <th scope="col">Льготный</th>
          </tr>
        </thead>
        <tbody>
          {ticketsPricesSeason2026.map((group) => (
            <Fragment key={group.id}>
              <tr className="tickets-page__prices-table-tribune">
                <th colSpan={3} scope="colgroup">
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={`${group.id}-${row.name}`}>
                  <td className="tickets-page__prices-table-sector">
                    <span className="tickets-page__prices-table-sector-name">{row.name}</span>
                    <span className="tickets-page__prices-table-sector-num">{row.sectors}</span>
                  </td>
                  <td>{row.standard} руб.</td>
                  <td>{row.concession} руб.</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
