"""
OSQuery osquery_schedule ORM
"""
from osquery_orm.orm import BaseModel
from peewee import BigIntegerField, IntegerField, TextField


class OsquerySchedule(BaseModel):
    """
    Information about the current queries that are scheduled in osquery.
    """
    name = TextField(help_text="The given name for this query")
    query = TextField(help_text="The exact query to run")
    interval = IntegerField(help_text="The interval in seconds to run this query, not an exact interval")
    executions = BigIntegerField(help_text="Number of times the query was executed")
    last_executed = BigIntegerField(help_text="UNIX time stamp in seconds of the last completed execution")
    denylisted = IntegerField(help_text="1 if the query is denylisted else 0")  # {'aliases': ['blacklisted']}
    output_size = BigIntegerField(help_text="Total number of bytes generated by the query")
    wall_time = BigIntegerField(help_text="Total wall time spent executing")
    user_time = BigIntegerField(help_text="Total user time spent executing")
    system_time = BigIntegerField(help_text="Total system time spent executing")
    average_memory = BigIntegerField(help_text="Average private memory left after executing")

    class Meta:
        table_name = "osquery_schedule"
