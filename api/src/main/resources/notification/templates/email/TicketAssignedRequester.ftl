Subject: Anna Darpan: Ticket Assigned – ${ticketId!""}

<p>Dear ${recipientName!userName!"User"},</p>

<p>Your ticket ${ticketId!ticketNumber!""} has been assigned<#if currentAssignee?? && currentAssignee?has_content> to ${currentAssignee}</#if><#if actorName?? && actorName?has_content> by ${actorName}</#if>.</p>

<#if updateMessage?? && updateMessage?has_content>
<p>${updateMessage}</p>
</#if>

<p>We will keep you informed of progress.</p>

<p>Regards,<br>
Anna Darpan Support Team</p>
