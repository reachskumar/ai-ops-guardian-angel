
import React from "react";

export const EmptyUsers: React.FC = () => (
  <tr>
    <td colSpan={4} className="py-6 text-center text-muted-foreground">
      No users found. Sign up to create a user.
    </td>
  </tr>
);
