"""
OSQuery wmi_script_event_consumers ORM
"""
from osquery_orm.orm import BaseModel
from peewee import TextField


class WmiScriptEventConsumers(BaseModel):
    """
    WMI ActiveScriptEventConsumer, which can be used for persistence on Windows. See https://www.blackhat.com/docs/us-15/materials/us-15-Graeber-Abusing-Windows-Management-Instrumentation-WMI-To-Build-A-Persistent%20Asynchronous-And-Fileless-Backdoor-wp.pdf for more details.
    Examples:
        select filter,consumer,query,scripting_engine,script_file_name,script_text,wsec.name from wmi_script_event_consumers wsec left outer join wmi_filter_consumer_binding wcb on consumer = wsec.relative_path left outer join wmi_event_filters wef on wef.relative_path = wcb.filter;
    """
    name = TextField(help_text="Unique identifier for the event consumer. ")
    scripting_engine = TextField(help_text="Name of the scripting engine to use, for example, \'VBScript\'. This property cannot be NULL.")
    script_file_name = TextField(help_text="Name of the file from which the script text is read, intended as an alternative to specifying the text of the script in the ScriptText property.")
    script_text = TextField(help_text="Text of the script that is expressed in a language known to the scripting engine. This property must be NULL if the ScriptFileName property is not NULL.")
    class_ = TextField(help_text="The name of the class.", column_name="class")
    relative_path = TextField(help_text="Relative path to the class or instance.")

    class Meta:
        table_name = "wmi_script_event_consumers"
